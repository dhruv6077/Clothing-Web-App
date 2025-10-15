
import { useAuth } from '../hooks/UserContext';
import { useNavigate } from "react-router-dom";
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';



const schema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    name: z.string().min(1, { message: "Name is required." }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // set the error on the confirmPassword field
});

type FormData = z.infer<typeof schema>;


export default function Register() {

    const { signup } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        console.log(data)
        try {
            await signup(data.email, data.password, data.name);
            // Navigate to home after successful signup
            navigate("/");
        } catch (error) {
            throw new Error("Registration failed. Please try again.");
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Card>

                <CardContent className="w-full mx-auto w-[400px]">
                    <CardTitle className='text-2xl font-semibold text-neutral-900 pb-4'>Sign up</CardTitle>
                    <CardDescription className='text-md font-semibold text-neutral-600 pb-8'>Sign up to get curated clothes</CardDescription>
                    {/* Wrap the inputs inside a form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Name"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>
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
                        <div className="mb-4">
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Link to="/login">
                            <button
                                type="submit"
                                className="bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded w-full mb-2"
                            >
                                Already have an account?
                            </button>
                        </Link>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                        >
                            Register
                        </button>
                    </form>
                </CardContent>

            </Card>
        </div>
    );
}
