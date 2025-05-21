import { useState } from "react";
import supabase from "../supabaseClient";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

function ForgotPassword({ closeModal, onBackToLogin }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            toast.success("Password reset instructions sent to your email!");
            closeModal();
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                ✕
            </button>

            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/40 blur-xl rounded-full scale-110"></div>
                    <img 
                        src="/images/logo.png" 
                        alt="Journata Logo" 
                        className="h-12 w-auto relative z-10 hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-center">Reset Your Password</h2>
            <p className="text-gray-600 mb-6 text-center">
                Enter your email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center border p-2 rounded w-full gap-2">
                    <Mail size={18} className="text-gray-600" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-transparent focus:outline-none"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
                >
                    {loading ? "Sending..." : "Send Reset Instructions"}
                </button>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition w-full"
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword; 