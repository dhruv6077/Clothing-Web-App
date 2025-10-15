import { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PasswordRecovery = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setShowModal(true); // Simulate sending email
    };

    return (
        <>
            <div className="w-full flex h-[80vh] justify-center items-center">
                <div className="w-fit">
                    <Card>
                        <CardContent className="mx-auto w-[400px]">
                            <CardTitle className="text-2xl font-semibold text-neutral-900 pb-4">
                                Password Recovery
                            </CardTitle>
                            <CardDescription className="text-md font-semibold text-neutral-600 pb-8">
                                Enter your email to recover your password
                            </CardDescription>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-2">
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm mt-1">{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
                                >
                                    Send Recovery Email
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Email Sent</DialogTitle>
                        <DialogDescription>
                            A password recovery email has been sent to <strong>{email}</strong>. Please check your inbox.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PasswordRecovery;



