// wishlistApi.ts

// Interface representing a Wishlist item
export interface Wishlist {
  id: number;
  name: string;
  user: {
    id: number;
    email?: string;
  };
}

// Interface representing data required to create or update a Wishlist
export interface NewWishlistData {
  name: string;
  userId: string;  // userId as string to match your API call pattern
}

// Fetch all wishlists for a user
export const fetchUserWishlists = async (userId: string): Promise<Wishlist[]> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching wishlists:', errorData);
    throw new Error('Error fetching wishlists');
  }
  const text = await response.text();
  return text ? JSON.parse(text) : [];
};

// Fetch a single wishlist by id for a user
export const fetchWishlistById = async (
  userId: string,
  wishlistId: string
): Promise<Wishlist> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Error fetching wishlist with id ${wishlistId}`);
  }
  return response.json();
};

// Create a new wishlist for a user
export const createWishlist = async (newWishlist: NewWishlistData): Promise<Wishlist> => {
  const response = await fetch(`http://localhost:8080/users/${newWishlist.userId}/wishlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newWishlist.name,
      user: { id: Number(newWishlist.userId) },
    }),
  });
  if (!response.ok) {
    throw new Error('Error creating wishlist');
  }
  return response.json();
};

// Update a wishlist by id for a user
export const updateWishlist = async (
  userId: string,
  wishlistId: string,
  updates: Partial<NewWishlistData>
): Promise<Wishlist> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Error updating wishlist');
  }
  return response.json();
};

// Delete a wishlist by id for a user
export const deleteWishlist = async (userId: string, wishlistId: string): Promise<void> => {
  const response = await fetch(`http://localhost:8080/users/${userId}/wishlists/${wishlistId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Could not delete wishlist with id ${wishlistId}`);
  }
};
