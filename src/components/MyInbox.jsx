import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

function MyInbox({ closeModal }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        const fetchUserAndMessages = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                console.log("No session found, user not logged in.");
                setUser(null);
                setMessages([]);
                setLoading(false);
                return;
            }

            const currentUser = session.user;
            setUser(currentUser);

            // Fetch messages for the logged-in user
            const { data, error } = await supabase
                .from("messages")
                .select("id, content, created_at, sender_id, receiver_id")
                .eq("receiver_id", currentUser.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching messages:", error.message);
                setMessages([]);
            } else {
                console.log("Fetched messages:", data); // Debug log
                setMessages(data);
            }

            setLoading(false);
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

    // Debug log to check component state
    console.log("Current messages:", messages);
    console.log("Current user:", user);
    console.log("Replying to:", replyingTo);

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">My Inbox</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500">You have no messages yet.</p>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
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
                                
                                {/* Reply Button - Made more prominent */}
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => {
                                            console.log("Reply button clicked for message:", msg.id); // Debug log
                                            setReplyingTo(msg);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
                                    >
                                        Reply to Message
                                    </button>
                                </div>

                                {/* Reply Form */}
                                {replyingTo?.id === msg.id && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleReply(msg)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                            >
                                                Send Reply
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
