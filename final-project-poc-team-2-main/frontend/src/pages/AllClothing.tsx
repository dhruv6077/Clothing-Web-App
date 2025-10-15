import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ClothingItem, fetchAllClothingItems } from "@/api/clothingApi";
import { User } from '@/hooks/UserContext';
import { fetchUserWishlists } from "@/api/wishlistApi";
import { addWishlistItem } from "@/api/wishlistItemApi";

// 1) Truncate helper
const truncate = (text: string, maxLength = 100): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "…" : text;

// Utility to pull unique values out of any ClothingItem field
const getUniqueValues = (
  items: ClothingItem[],
  key: keyof ClothingItem
): string[] => Array.from(new Set(items.map((item) => item[key] as string)));

type Filters = {
  gender?: string;
  color?: string;
  material?: string;
  pattern?: string;
  priceRange?: string;
};

interface AllClothingPageProps {
  user: User;
}

const AllClothing: React.FC<AllClothingPageProps> = ({ user }) => {
  const {
    data: clothingItems = [],
    isLoading,
    isError,
    error,
  } = useQuery<ClothingItem[], Error>({
    queryKey: ["clothingItems"],
    queryFn: fetchAllClothingItems,
  });

  //for wishlist
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
    const {
        data: wishlists = [],
        isLoading: loadingWishlists,
        error: wishlistError,
        } = useQuery({
    queryKey: ["wishlists", user],
    queryFn: () => fetchUserWishlists(user.id),
    });

  const [filters, setFilters] = useState<Filters>({});
  const updateFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({});

  const filteredClothing = useMemo(() => {
    return clothingItems.filter((item) => {
      const { gender, color, material, pattern, priceRange } = filters;
      let priceMatch = true;
      if (priceRange) {
        const priceNum = parseFloat(
          item.estimatedPricing.replace(/[^0-9.]/g, "")
        );
        if (priceRange.endsWith("+")) {
          priceMatch = priceNum >= parseFloat(priceRange);
        } else {
          const [min, max] = priceRange.split("-").map(Number);
          priceMatch = priceNum >= min && priceNum <= max;
        }
      }
      return (
        (!gender || item.gender === gender) &&
        (!color || item.color === color) &&
        (!material || item.material === material) &&
        (!pattern || item.pattern === pattern) &&
        priceMatch
      );
    });
  }, [clothingItems, filters]);

  const updatingFiltersDynamiclally = (updFilter: keyof Filters) => {
    return clothingItems.filter((item) => {
      return Object.entries(filters).every(([k, v]) => {
        if (k === updFilter || !v) return true;
        if (k === "priceRange") {
          const priceNum = parseFloat(
            item.estimatedPricing.replace(/[^0-9.]/g, "")
          );
          if (v.endsWith("+")) return priceNum >= parseFloat(v);
          const [minPrice, maxPrice] = v.split("-").map(Number);
          if (priceNum >= minPrice && priceNum <= maxPrice) {
            return true;
          } else {
            return false;
          }
        }
        if (v === item[k as keyof ClothingItem]) {
          return true;
        } else {
          return false;
        }
      });
    });
  };
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);

  const chooseForPriceRanges = (itms: ClothingItem[]): string[] => {
    const priceRange = new Set<string>();
    itms.forEach((itm) => {
      const priceNum = parseFloat(itm.estimatedPricing.replace(/[^0-9.]/g, ""));
      priceNum > 0 && priceNum <= 30
        ? priceRange.add("0-30")
        : priceNum >= 30 && priceNum <= 60
        ? priceRange.add("30-60")
        : priceRange.add("60+");
    });
    return [...priceRange];
  };

  if (isLoading) return <p className="text-center py-10">Loading items…</p>;
  if (isError)
    return (
      <p className="text-center py-10 text-red-500">Error: {error.message}</p>
    );

  return (
    <div className="flex max-w-full mx-auto p-6 gap-24">
      {/* Sidebar */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>

        {(["gender", "color", "material", "pattern"] as (keyof Filters)[]).map(
          (key) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize">{key}</label>
              <Select
                value={filters[key] || ""}
                onValueChange={(value) => updateFilter(key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueValues(
                    updatingFiltersDynamiclally(key),
                    key as keyof ClothingItem
                  ).map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        )}

        <div>
          <label className="block text-sm mb-1">Price Range</label>
          <Select
            value={filters.priceRange || ""}
            onValueChange={(value) => updateFilter("priceRange", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {chooseForPriceRanges(
                updatingFiltersDynamiclally("priceRange")
              ).map((range) => (
                <SelectItem key={range} value={range}>
                  {range === "0-30" && "$0 – $30"}
                  {range === "30-60" && "$30 – $60"}
                  {range === "60+" && "$60+"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </aside>

      {/* Results Grid */}
      <main className="w-3/4">
        {filteredClothing.length === 0 ? (
          <p className="text-gray-600">No items match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredClothing.map((item) => (
              <Card
                key={item.id}
                className="mx-auto w-full flex flex-col h-full" /* <- make card full-height flex */
              >
                <CardHeader className="p-0">
                  <div className="aspect-[5/3] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                    <img
                      src={`./clothes/${item.imageUrl}`}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* <- take up remaining space */}
                  <CardTitle>
                    <button
                        onClick={() => setSelectedClothing(item)}
                        className="text-black-600 underline hover:text-blue-800"
                    >{item.name}</button>
                    </CardTitle>
                  <CardDescription>{item.pattern}</CardDescription>
                  <p className="mt-2 text-sm text-gray-700">
                    {truncate(item.description, 80)} {/* <- truncated */}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.estimatedPricing} • {item.color}, {item.material}
                  </p>
                </CardContent>

                <CardFooter className="mt-auto">
                  {/* <- push to bottom */}
                  <Button
                    className="w-full"
                    onClick={() => {
                    setSelectedItemId(item.id);
                    setIsDialogOpen(true);
                    }}
                    >
                    Add to wishlist
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Select Wishlist</DialogTitle>
      <DialogDescription>Choose a wishlist to add this item to.</DialogDescription>
    </DialogHeader>
    <div className="space-y-2">
      {loadingWishlists ? (
        <p>Loading wishlists…</p>
      ) : wishlistError ? (
        <p className="text-red-500">Failed to load wishlists</p>
      ) : (
        wishlists.map((wl) => (
          <Button
            key={wl.id}
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              if (selectedItemId != null) {
                try {
                  await addWishlistItem(user.id, wl.id.toString(), selectedItemId);
                  setIsDialogOpen(false);
                  setSelectedItemId(null);
                } catch (error) {
                  alert("Item already added to this wishlist");
                }
              }
            }}
          >
            {wl.name}
          </Button>
        ))
      )}
    </div>
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
      </main>
    </div>
  );
};

export default AllClothing;
