import { useState } from 'react';
import { useAuth } from '../hooks/UserContext';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Link, useNavigate} from 'react-router';


const schema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
    const { login } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        const result = await login(data.email, data.password);
        if (!result.success) {
            setLoginError(result.error || 'Invalid email or password');
        } else {
            setLoginError(null); // Clear the error if successful
            
            //redirect the user to dashboard
            navigate('/allclothing');
            
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Card>
                <CardContent className="w-full mx-auto w-[400px]">
                    <CardTitle className='text-2xl font-semibold text-neutral-900 pb-4'>Login</CardTitle>
                    <CardDescription className='text-md font-semibold text-neutral-600 pb-8'>Sign in to access your todo list</CardDescription>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <Input
                                type="password"
                                placeholder="Password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        {loginError && (
                            <p className="text-red-600 text-sm mb-4">{loginError}</p>
                        )}

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2"
                        >
                            Login
                        </button>

                        <Link to="/register">
                            <button
                                type="button"
                                className="bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded w-full mb-2"
                            >
                                Create a new account
                            </button>
                        </Link>

                        <Link to="/forgot-password">
                            <button
                                type="button"
                                className="bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded w-full"
                            >
                                Forgot password
                            </button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
