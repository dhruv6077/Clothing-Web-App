export interface WishlistItem {
  id: number;
  wishlistId: number;
  clothingItemId: number;
}

// Fetch all items in a wishlist
export const fetchWishlistItems = async (
  userId: string,
  wishlistId: string
): Promise<WishlistItem[]> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}/items`);
  if (!response.ok) throw new Error('Failed to fetch wishlist items');
  return response.json();
};

// Add an item to a wishlist
export const addWishlistItem = async (
  userId: string,
  wishlistId: string,
  clothingItemId: number
): Promise<WishlistItem> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clothingItemId }),
  });
  if (!response.ok) throw new Error('Failed to add wishlist item');
  return response.json();
};

// Delete an item from a wishlist
export const deleteWishlistItem = async (
  userId: string,
  wishlistId: string,
  itemId: number
): Promise<void> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete wishlist item');
};
