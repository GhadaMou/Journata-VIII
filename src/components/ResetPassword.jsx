import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
        setMessage("Invalid or missing token.");
    }
    }, [searchParams]);

    const handleReset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        setMessage(error.message);
    } else {
        setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000); // redirect after 3 seconds
    }
    };

    return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-semibold mb-4">Reset your password</h2>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleReset}>
        <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
            Update Password
        </button>
        </form>
    </div>
    );
}

export default ResetPassword;
