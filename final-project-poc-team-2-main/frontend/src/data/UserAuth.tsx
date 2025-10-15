export async function Register(email: string, password: string, name: string) {
    console.log("Registering...");

    const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    const data = await response.json(); // only call once
    console.log("Registration response:", data);
    return data;
}


export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

export async function Login(email: string, password: string): Promise<AuthResponse> {
    console.log("Logging in...");

    const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });


    if (!res.ok) {
        // Optionally, you can parse the error response here to provide more details.
        throw new Error(`Login failed: ${res.status} ${res.statusText}`);
    }

    const response: AuthResponse = await res.json();
    console.log("Login response:", response);
    return response;
}


export async function Logout() {

    console.log("Logging in...");
    const data = await fetch('http://localhost:8080/auth/logout')

    console.log(data);
    const response = await data.json();
    console.log(response);
}
