// 1) Define the raw shape exactly as the API returns it:
export interface ClothingItemApi {
    id: number;
    name: string;
    description: string;
    color: string;              // hex code
    pattern: string;
    material: string;           
    estimatedPricing: string;   // e.g. "$80" or "$40–$60"
    gender: 'male' | 'female' | 'unisex';
    events: string;             // comma-separated
    typeOfClothing: string;
    imageUrl: string;
  }
  
  // 2) Define your “app-friendly” shape:
  export interface ClothingItem {
    id: number;
    name: string;
    description: string;
    color: string;
    pattern: string;
    material: string;
    estimatedPricing: string;
    gender: 'male' | 'female' | 'unisex';
    events: string[];           // now an array
    typeOfClothing: string;
    imageUrl: string;
  }
  
  // 3) Utility to parse the raw events string:
  const parseEvents = (raw: string): string[] =>
    raw.split(',').map((e) => e.trim()).filter(Boolean);
  
  // 4) Fetch + map to your app type:
  export const fetchAllClothingItems = async (): Promise<ClothingItem[]> => {
    const res = await fetch('http://localhost:8080/api/clothing-items', {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error fetching clothing items');
  
    const data: ClothingItemApi[] = await res.json();
    return data.map((item) => ({
      ...item,
      events: parseEvents(item.events),
    }));
  };
  

