import { useState } from "react";
import supabase from "../supabaseClient";
import { Mail, Lock } from "lucide-react";
import ForgotPassword from "./ForgotPassword";
import { useNavigate } from "react-router-dom";

function LoginForm({ setUser, closeModal, onLoginSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("worker");
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            // Call the success handler
            onLoginSuccess();
            closeModal();
            navigate("/app"); // Navigate to client dashboard after login
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <ForgotPassword 
                closeModal={closeModal} 
                onBackToLogin={() => setShowForgotPassword(false)} 
            />
        );
    }

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

                    <div className="flex items-center border p-2 rounded w-full gap-2">
                        <Lock size={18} className="text-gray-600" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent focus:outline-none"
                        />
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
                    >
                        {loading ? "Logging In..." : "Log In"}
                    </button>

                    <p className="text-sm text-right mt-2">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-blue-500 hover:underline"
                        >
                            Forgot your password?
                        </button>
                    </p>
                </form>
            </div>
    );
}

export default LoginForm;
