import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { Lock } from "lucide-react";
import { toast } from 'react-toastify';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = searchParams.get("access_token");
        console.log("Access token from URL:", accessToken);
        if (!accessToken) {
            setError("Invalid or missing token. Please request a new password reset link.");
        }
    }, [searchParams]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        

        // Validate passwords
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
            
        }
        try {
            const { error } = await supabase.auth.updateUser({ 
                password: newPassword 
            });

            if (error) throw error;

            toast.success("Password updated successfully!");
            setTimeout(() => navigate("/"), 3000);
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/40 blur-xl rounded-full scale-110"></div>
                        <img 
                            src="/images/logo.png" 
                            alt="Journata Logo" 
                            className="h-12 w-auto relative z-10 hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your new password below
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleReset}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="flex items-center border p-2 rounded w-full gap-2">
                            <Lock size={18} className="text-gray-600" />
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full bg-transparent focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center border p-2 rounded w-full gap-2">
                            <Lock size={18} className="text-gray-600" />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-transparent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
