import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { User } from '@/hooks/UserContext';
import { createWishlist, deleteWishlist, fetchUserWishlists } from '@/api/wishlistApi';
import { deleteWishlistItem, fetchWishlistItems } from '@/api/wishlistItemApi';

interface Wishlist {
  id: number;
  name: string;
  products: WListItm[];
}

interface WishlistPageProps {
  user: User;
}
interface WListItm {
  id: number;
  wishlistItemId: number;
}



const WishlistPage: React.FC<WishlistPageProps> = ({ user }) => {
  const [wLsts, setWLsts] = useState<Wishlist[]>([]);

  const [deletingItem, setDeletingItem] = useState<{ listId: number; itemId: number } | null>(null);
  const [deletingListId, setDeletingListId] = useState<number | null>(null);
  const [showNLst, setShowNLst] = useState(false);
  const [nameForNewList, setNameForNewList] = useState('');
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);

  interface ClothingItem {
  id: number;
  name: string;
  color: string;
  pattern: string;
  material: string;
  gender: string;
  typeOfClothing: string;
  events: string;
  estimatedPricing: string;
  imageUrl: string;
  description: string;
}

const [clothingMap, setClothingMap] = useState<Record<number, ClothingItem>>({});

React.useEffect(() => {
  async function fetchClothingData() {
    try {
      const res = await fetch('http://localhost:8080/api/clothing-items');
      if (!res.ok) throw new Error('Failed to fetch clothing items');
      const data: ClothingItem[] = await res.json();

      // Build the lookup map by ID
      const map: Record<number, ClothingItem> = {};
      data.forEach((item) => {
        map[item.id] = item;
      });

      setClothingMap(map);
    } catch (err) {
      console.error(err);
    }
}
fetchClothingData();
async function loadWishlists() {
    console.log("Loading wishlists...");
  try {
    const wishlists = await fetchUserWishlists(user.id);
    const fullWishlists = await Promise.all(
    wishlists.map(async (wishlist) => {
    const items = await fetchWishlistItems(user.id.toString(), wishlist.id.toString());
    const productIds = items.map(item => ({ 
      id: item.clothingItemId,  // for display info lookup
      wishlistItemId: item.id   // needed to delete the item properly
    }));
      return {
      id: wishlist.id,
      name: wishlist.name,
      products: productIds,
      };
     })
    );
    setWLsts(fullWishlists);
  } catch (err) {
    console.error('Error loading wishlists:', err);
  }
}
loadWishlists();
}, [user.id]);

  async function handleNewList() {
  if (!user?.id) return;

  const getNextWishlistNumber = (existingNames: string[]) => {
  const numbers = existingNames
    .map((name) => {
      const match = name.match(/Wish List No: (\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const lastUsed = Math.max(100, ...numbers);
  const stored = parseInt(localStorage.getItem('lastWishlistNumber') || '99', 10);
  const next = Math.max(lastUsed + 1, stored + 1);
  localStorage.setItem('lastWishlistNumber', next.toString());
  return next;
};

  const nextNumber = getNextWishlistNumber(wLsts.map(w => w.name));
  const wishlistName = nameForNewList || `Wish List No: ${nextNumber}`;

  try {
    const created = await createWishlist({
      name: wishlistName,
      userId: user.id.toString(),
    });
    const newWishlist = {
      id: created.id,
      name: created.name,
      products: [], // backend won't return products; we initialize empty
    };

    setWLsts((prev) => [...prev, newWishlist]);
    setNameForNewList('');
    setShowNLst(false);
  } catch (error) {
    console.error('Failed to create wishlist:', error);
  }
}

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your WishLists</h2>
        <Dialog open={showNLst} onOpenChange={setShowNLst}>
          <DialogTrigger asChild>
            <Button>Add New WishList</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New WishList</DialogTitle>
            </DialogHeader>
            <Input
              value={nameForNewList}
              onChange={(e) => setNameForNewList(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewList();
                }
              }}
              placeholder="Add a WishList Name"
            />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowNLst(false)}>
                Cancel
              </Button>
              <Button onClick={handleNewList}>Create WishList</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {wLsts.map((wList) => (
        <div key={wList.id} className="border rounded p-4 shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="bg-primary text-white px-3 py-1 rounded text-sm">{wList.name}</h3>
            <Dialog open={deletingListId === wList.id} onOpenChange={(open) => !open && setDeletingListId(null)}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeletingListId(wList.id)}
                >
                  Delete List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete List</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this wishlist?</p>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                    try {
                        if (deletingListId === null) return;
                        await deleteWishlist(user.id.toString(), deletingListId.toString());
                        setWLsts(wLsts.filter(w => w.id !== deletingListId));
                        setDeletingListId(null);
                    } catch (error) {
                    console.error('Failed to delete wishlist:', error);
                    }
                }}
                >
                Delete
                </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <table className="w-full border text-center text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th></th>
                <th>Item</th>
                <th>Color</th>
                <th>Pattern</th>
                <th>Material</th>
                <th>Gender</th>
                <th>Type</th>
                <th>Event</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
                
              {wList.products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-4 text-gray-500">
                    There are no items in this WishList.
                  </td>
                </tr>
              ) : (
                wList.products.map(({ id, wishlistItemId }) => {
  const product = clothingMap[id];
  if (!product) {
    // If the product data isn't loaded yet, render a placeholder row or skip
    return (
      <tr key={id} className="border-t">
        <td colSpan={10} className="text-center text-gray-500 py-2">
          Loading...
        </td>
      </tr>
    );
  }

  return (
    
    <tr key={id} className="border-t">
      <td>
        <Dialog
          open={deletingItem?.listId === wList.id && deletingItem?.itemId === wishlistItemId}
          onOpenChange={(open) => !open && setDeletingItem(null)}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600"
              onClick={() => setDeletingItem({ listId: wList.id, itemId: wishlistItemId })}
            >
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to remove this product from the wishlist?</p>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeletingItem(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                try {
                    if (!deletingItem) return;
                await deleteWishlistItem(
                    user.id.toString(),
                    deletingItem.listId.toString(),
                    deletingItem.itemId
                );
                const updated = wLsts.map(list =>
                list.id === deletingItem.listId
                ? {
                    ...list,
                    products: list.products.filter(p => p.wishlistItemId !== deletingItem.itemId)
                    }
                : list
            );
            setWLsts(updated);
            setDeletingItem(null);
            } catch (error) {
            console.error('Failed to delete wishlist item:', error);
            }
        }}
        >
        Delete
        </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={!!selectedClothing} onOpenChange={() => setSelectedClothing(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{selectedClothing?.name}</DialogTitle>
      <DialogFooter>{selectedClothing?.description}</DialogFooter>
    </DialogHeader>
    {selectedClothing?.imageUrl ? (
      <img src={`./clothes/${selectedClothing.imageUrl}`} alt={selectedClothing.name} className="w-full max-w-md max-h-96 object-contain rounded" />
    ) : (
      <p className="text-gray-500">No image available.</p>
    )}
  </DialogContent>
</Dialog>
      </td>
      <button
    onClick={() => setSelectedClothing(product)}
    className="text-black-600 underline hover:text-blue-800"
  >
    {product.name}
  </button>
    <td>{product.color}</td>
    <td>{product.pattern}</td>
    <td>{product.material}</td>
    <td>{product.gender}</td>
    <td>{product.typeOfClothing}</td>
    <td>{product.events}</td>
    <td>{product.estimatedPricing}</td>
    </tr>
  );
})

              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default WishlistPage;
