import React, { useState, useMemo, useEffect } from "react";
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
import { useLocation } from "react-router-dom";

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
  events?: string;
  typeOfClothing?: string;
  color?: string[];
  material?: string[];
  pattern?: string[];
  priceRange?: string;
};

interface AllClothingPageProps {
  user: User;
}


//survey set manual TODO
const colorMapping: Record<string, string[]> = {
  //q5
  neutral: ["white", "black", "gray","beige"],
  contrast: ["blue", "green","purple","red","yellow","white","beige","black"],
  mood: ["pink", "purple","red","blue","yellow","orange","green"],
  everything: ["white", "black", "gray","beige","blue","orange","brown",
    "green","pink","purple","red","yellow"],
  //q10
  cottage: ["green", "brown", "beige"],
  studio: ["red", "purple", "black"],
  beach: ["blue", "yellow", "white"],
  cafe: ["orange", "gray", "pink"],
};

const materialMapping: Record<string, string[]> = {
  //q2
   streetwear_poly: ["polyester", "faux fur", "nylon", "leather"],
  casual_denim: ["denim", "cotton blend", "knit cotton", "fleece"],
  minimalist: ["linen", "wool blend", "knitted fabric", "suede leather"],
  //q7
  active: ["polyester", "cotton", "nylon", "spandex"],
  home: ["flannel", "knit fabric", "fleece", "cotton blend"],
  creating: ["denim", "silk", "knitted cotton", "lace"],
  night: ["leather", "suede leather", "wool", "silk"],
  //q15
  love: ["leather", "faux fur", "lace", "denim with sherpa lining"],
  tolerate: ["cotton", "knit cotton", "polyester", "flannel"],
  avoid: ["linen", "wool blend", "knitted fabric", "suede leather"],
  ignore: ["cotton blend", "denim", "nylon", "gray jersey"],

  everything: ["cotton", "cotton blend", "denim", "denim with sherpa lining", 
    "faux fur", "fleece", "fur", "knit cotton", "knit fabric", 
    "knitted cotton", "knitted fabric", "lace", "leather", "linen", "nylon", 
    "polyester", "silk", "suede leather", "wool", "wool blend"]

};

const patternMapping: Record<string, string[]> = {
  //q1
  casual: ["solid","striped","ribbed","knitted","distressed", 
    "solid with subtle texture", "checkered"
  ],
  formal: [
    "plaid","windowpane check", "lace", "lace inset", "solid with lace detail", 
    "textured knit", "solid with mesh panels"
  ],
  streetwear: [
    "graphic", "graphic print", "logo print", "color block", "animal print", 
    "abstract swirl", "text print", "solid with text"
  ],
  //q2
  streetwear_poly: ["graphic", "logo print", "color block", "abstract swirl", 
    "animal print", "text print", "solid with text", "distressed"],
  casual_denim: ["checkered", "checked", "striped", "ribbed", "knitted", 
    "solid with subtle texture", "textured"],
  minimalist: ["solid", "solid with mesh panels", "solid with lace detail", 
    "lace inset", "lace", "quilted", "eyelet", "cable knit", "windowpane check"],
  //q11
  graphic: ["graphic", "graphic print", "logo print", "text print", "abstract", 
    "abstract swirl", "color block", "animal print"],
  solid: ["solid", "solid with subtle texture", "solid with lace detail", 
    "solid with mesh panels", "solid with text"],
  pattern: ["striped", "checkered", "checked", "plaid", "polka dot", 
    "windowpane check"],

  everything: ["abstract", "abstract swirl", "animal print", "cable knit", 
    "checkered", "checked", "color block", "crochet", "distressed", 
    "embroidered floral", "eyelet", "floral", "floral and geometric print", 
    "geometric", "graphic", "graphic print", "knitted", "lace", "lace inset", 
    "logo print", "plaid", "polka dot", "quilted", "ribbed", "solid", 
    "solid top with striped skirt", "solid with lace detail", 
    "solid with mesh panels", "solid with subtle texture", "solid with text", 
    "striped", "text print", "textured", "textured knit", "windowpane check"]

};


//map for survey to filter
function mapMultipleQuestions<T>(
  answers: Record<string, any>,
  questions: string[],
  mapping: Record<string, T[]>
): T[] | undefined {
  const values = questions.flatMap(q =>
    mapping[answers[q]] ?? (answers[q] ? [answers[q]] : [])
  );
  return values.length > 0 ? Array.from(new Set(values)) : undefined;
}

// eslint-disable-next-line react-refresh/only-export-components
export function mapSurveyToFilters(answers: Record<string, any>): Filters {
    console.log(answers.q16);
  return {
    //for each answer must be a q
    color: mapMultipleQuestions(answers, ["q5", "q10"], colorMapping),
    material: mapMultipleQuestions(answers, ["q2", "q7", "q15"], materialMapping),
    pattern: mapMultipleQuestions(answers, ["q1", "q2", "q11"], patternMapping),
    priceRange: answers.q16,
    
  };
}

const CuratedClothing: React.FC<AllClothingPageProps> = ({ user }) => {
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
  const clearFilters = () =>
  setFilters((prev) => ({
    ...prev,
    gender: undefined,
    typeOfClothing: undefined,
    events: undefined,
  }));

  //survey
  const location = useLocation();
    useEffect(() => {
  const state = location.state as { survey?: Record<string, any> } | undefined;
    if (state?.survey) {
    const mapped = mapSurveyToFilters(state.survey);
    setFilters(mapped);
    }
    }, [location.state]);


  const filteredClothing = useMemo(() => {
  return clothingItems.filter((item) => {
    const { gender, events, typeOfClothing, color, material, pattern, priceRange } = filters;
    
    let priceMatch = true;
    if (priceRange && typeof priceRange === "string") {
      const priceNum = parseFloat(item.estimatedPricing.replace(/[^0-9.]/g, ""));
      if (priceRange.endsWith("+")) {
        priceMatch = priceNum >= parseFloat(priceRange);
      } else {
        const [min, max] = priceRange.split("-").map(Number);
        priceMatch = priceNum >= min && priceNum <= max;
      }
    }

    const matchField = (fieldFilter: string | string[] | undefined, itemValue: string) => {
      if (!fieldFilter) return true;
      if (Array.isArray(fieldFilter)) {
        return fieldFilter.includes(itemValue);
      }
      return fieldFilter === itemValue;
    };

    const eventsMatch =
  !events ||
  (Array.isArray(item.events) && (item.events as string[]).includes(events)) ||
  (typeof item.events === "string" && (item.events as string).includes(events));



    return (
      (!gender || item.gender === gender) &&
      eventsMatch &&
      (!typeOfClothing || item.typeOfClothing === typeOfClothing) &&
      matchField(color, item.color) &&
      matchField(material, item.material) &&
      matchField(pattern, item.pattern) &&
      priceMatch
    );
  });
}, [clothingItems, filters]);

const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);

  const updatingFiltersDynamiclally = (updFilter: keyof Filters) => {
  return clothingItems.filter((item) => {
    return Object.entries(filters).every(([k, v]) => {
      if (k === updFilter || !v) return true;

      if (k === "priceRange") {
        const priceNum = parseFloat(item.estimatedPricing.replace(/[^0-9.]/g, ""));
        if (typeof v === "string") {
          if (v.endsWith("+")) return priceNum >= parseFloat(v);
          const [minPrice, maxPrice] = v.split("-").map(Number);
          return priceNum >= minPrice && priceNum <= maxPrice;
        }
        return false;
      }

      if (Array.isArray(v)) {
        return v.includes(item[k as keyof ClothingItem] as string);
      } else {
        return v === item[k as keyof ClothingItem];
      }
    });
  });
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

        {(["gender","typeOfClothing"] as (keyof Filters)[]).map(
          (key) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize">{key}</label>
              <Select
                value={typeof filters[key] === "string" ? filters[key] : ""}
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

export default CuratedClothing;
