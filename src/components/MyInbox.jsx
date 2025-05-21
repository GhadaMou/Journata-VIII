import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

function MyInbox({ closeModal }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserAndMessages = async () => {
            try {
            setLoading(true);
                setError(null);
                
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                    setError("You must be logged in to view messages");
                setUser(null);
                setMessages([]);
                return;
            }

            const currentUser = session.user;
            setUser(currentUser);

            const { data, error } = await supabase
                .from("messages")
                    .select(`
                        id, 
                        content, 
                        created_at, 
                        sender_id, 
                        receiver_id
                    `)
                .eq("receiver_id", currentUser.id)
                .order("created_at", { ascending: false });

                if (error) throw error;

                setMessages(data || []);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError(err.message);
            } finally {
            setLoading(false);
            }
        };

        fetchUserAndMessages();
    }, []);

    const handleReply = async (message) => {
        if (!replyContent.trim()) return;

        try {
            const { error } = await supabase.from("messages").insert([
                {
                    sender_id: user.id,
                    receiver_id: message.sender_id,
                    content: replyContent,
                },
            ]);

            if (error) throw error;

            setReplyContent("");
            setReplyingTo(null);

            // Refresh messages
            const { data, error: fetchError } = await supabase
                .from("messages")
                .select("id, content, created_at, sender_id, receiver_id")
                .eq("receiver_id", user.id)
                .order("created_at", { ascending: false });

            if (!fetchError) {
                setMessages(data);
            }
        } catch (error) {
            console.error("Error sending reply:", error.message);
        }
    };

    return (
        <div className="absolute top-16 right-0 w-[400px] bg-white rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4">
                {error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : loading ? (
                    <p className="text-center text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500">You have no messages yet.</p>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="mb-2">
                                    <p className="text-gray-700">{msg.content}</p>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-500">
                                        <span>From: </span>
                                        <span className="font-medium">{msg.sender_id.slice(0, 6)}...</span>
                                    </div>
                                    <div className="text-gray-400">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </div>
                                </div>
                                
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => setReplyingTo(msg)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        Reply
                                    </button>
                                </div>
                                {replyingTo?.id === msg.id && (
                                    <div className="mt-2 p-2 bg-white rounded-lg border">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            rows={2}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleReply(msg)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyInbox;
