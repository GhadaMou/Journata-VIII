import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function MessageForm({ workerId, onClose }) {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        };
        getUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user) {
            setError("You must be logged in to send a message.");
            return;
        }

        if (!message.trim()) {
            setError("Message cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from("messages").insert([
                {
                    sender_id: user.id,
                    receiver_id: workerId,
                    content: message,
                },
            ]);

            if (error) throw error;

            setSuccess(true);
            setMessage("");

            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Send a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message:</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message..."
                            className="border p-2 w-full rounded"
                            rows={4}
                        ></textarea>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">Message sent successfully!</p>}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition w-full"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MessageForm;
