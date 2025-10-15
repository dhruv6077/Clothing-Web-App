// api/userApi.ts

import { User } from "@/hooks/UserContext";


export async function getUser(userId: string): Promise<User> {
    const response = await fetch(`http://localhost:8080/auth/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        // You can optionally parse a JSON error or just return plain text
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to fetch user.');
    }

    const user: User = await response.json();
    return user;
}
