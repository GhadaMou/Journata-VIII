import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

function MyInbox({ closeModal }) {
    const [conversations, setConversations] = useState([]); // List of conversations (unique users)
    const [selectedUser, setSelectedUser] = useState(null); // The user we're chatting with
    const [chatMessages, setChatMessages] = useState([]); // Messages in the selected conversation
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState(null);
    const [profiles, setProfiles] = useState({}); // user_id -> profile
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteUserId, setPendingDeleteUserId] = useState(null);

    // Move fetchUserAndConversations outside useEffect so it can be called from anywhere
    const fetchUserAndConversations = async () => {
            try {
            setLoading(true);
                setError(null);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                    setError("You must be logged in to view messages");
                setUser(null);
                setConversations([]);
                return;
            }
            const currentUser = session.user;
            setUser(currentUser);
            // Fetch all messages where user is sender or receiver
            const { data: messages, error } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order("created_at", { ascending: false });
            if (error) throw error;
            // Collect all unique user ids (other than current user)
            const userIds = new Set();
            messages.forEach((msg) => {
                if (msg.sender_id !== currentUser.id) userIds.add(msg.sender_id);
                if (msg.receiver_id !== currentUser.id) userIds.add(msg.receiver_id);
            });
            // Fetch all profiles in one query
            let profilesMap = {};
            if (userIds.size > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select("user_id, name, profile_picture")
                    .in("user_id", Array.from(userIds));
                if (profilesError) throw profilesError;
                profilesMap = Object.fromEntries(
                    profilesData.map((p) => [p.user_id, p])
                );
            }
            setProfiles(profilesMap);
            // Build conversation list: unique other users
            const convoMap = {};
            messages.forEach((msg) => {
                // Find the other user in this message
                const otherUserId =
                    msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
                if (!otherUserId) return;
                const otherUserProfile = profilesMap[otherUserId] || { user_id: otherUserId };
                // Only keep the latest message for each conversation
                if (!convoMap[otherUserId] || new Date(msg.created_at) > new Date(convoMap[otherUserId].created_at)) {
                    convoMap[otherUserId] = {
                        user: otherUserProfile,
                        lastMessage: msg.content,
                        created_at: msg.created_at,
                        unreadCount: 0 // Initialize unreadCount
                    };
                }
            });
            // Count unread messages for each conversation
            for (const otherUserId in convoMap) {
                const { data: unreadData, error: unreadError } = await supabase
                    .from("messages")
                    .select("id")
                    .eq("receiver_id", currentUser.id)
                    .eq("sender_id", otherUserId)
                    .is("is_read", false);
                if (unreadError) throw unreadError;
                convoMap[otherUserId].unreadCount = unreadData ? unreadData.length : 0;
            }
            // Convert to array and sort by latest message
            const convoArr = Object.values(convoMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setConversations(convoArr);
            // Auto-select the first conversation if none selected
            if (!selectedUser && convoArr.length > 0) {
                setSelectedUser(convoArr[0].user);
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUserAndConversations();
        // eslint-disable-next-line
    }, []);

    // Fetch chat messages for selected conversation
    useEffect(() => {
        const fetchChatMessages = async () => {
            if (!user || !selectedUser) return;
            setLoading(true);
            try {
                const { data: messages, error } = await supabase
                    .from("messages")
                    .select("*")
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.user_id || selectedUser.id}),and(sender_id.eq.${selectedUser.user_id || selectedUser.id},receiver_id.eq.${user.id})`)
                    .order("created_at", { ascending: true });
                if (error) throw error;
                setChatMessages(messages || []);
                // Mark messages as read
                const unreadMessages = messages.filter(msg => msg.receiver_id === user.id && !msg.is_read);
                if (unreadMessages.length > 0) {
                    const { error: updateError } = await supabase
                        .from("messages")
                        .update({ is_read: true })
                        .in("id", unreadMessages.map(msg => msg.id));
                    if (updateError) throw updateError;
                    // Refresh conversations to update unread badge
                    fetchUserAndConversations();
                }
            } catch (err) {
                setError(err.message);
            } finally {
            setLoading(false);
            }
        };
        fetchChatMessages();
    }, [selectedUser, user]);

    // Send a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !user || !selectedUser) return;
        try {
            const { error } = await supabase.from("messages").insert([
                {
                    sender_id: user.id,
                    receiver_id: selectedUser.user_id || selectedUser.id,
                    content: messageInput,
                },
            ]);
            if (error) throw error;
            setMessageInput("");
            // Refresh chat
            const { data: messages } = await supabase
                .from("messages")
                .select("*")
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.user_id || selectedUser.id}),and(sender_id.eq.${selectedUser.user_id || selectedUser.id},receiver_id.eq.${user.id})`)
                .order("created_at", { ascending: true });
            setChatMessages(messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    // Show modal and set pending delete user
    const openDeleteModal = (userId) => {
        setPendingDeleteUserId(userId);
        setShowDeleteModal(true);
    };
    // Hide modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPendingDeleteUserId(null);
    };

    // Delete conversation after confirmation
    const confirmDeleteConversation = async () => {
        if (!user || !pendingDeleteUserId) return;
        try {
            const { error } = await supabase
                .from("messages")
                .delete()
                .or(
                    `and(sender_id.eq.${user.id},receiver_id.eq.${pendingDeleteUserId}),and(sender_id.eq.${pendingDeleteUserId},receiver_id.eq.${user.id})`
                );
            if (error) throw error;
            // Remove the conversation from the UI
            setConversations((prev) => prev.filter((c) => (c.user.user_id || c.user.id) !== pendingDeleteUserId));
            if (selectedUser && (selectedUser.user_id || selectedUser.id) === pendingDeleteUserId) {
                setSelectedUser(null);
                setChatMessages([]);
            }
            closeDeleteModal();
        } catch (err) {
            setError(err.message);
            closeDeleteModal();
        }
    };

    return (
        <div className="fixed top-16 right-0 w-[700px] h-[600px] bg-white rounded-lg shadow-lg z-50 flex overflow-hidden border border-gray-200">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                        <div className="text-4xl text-red-500 mb-4">⚠️</div>
                        <div className="text-lg font-semibold mb-2 text-center">Delete Conversation?</div>
                        <div className="text-gray-600 mb-6 text-center">Are you sure you want to delete this conversation? <br />This will permanently delete all messages between you and this user.</div>
                        <div className="flex gap-4 w-full justify-center">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteConversation}
                                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Conversation List */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
                <div className="p-4 font-bold text-lg border-b">Conversations</div>
                {loading ? (
                    <div className="p-4 text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="p-4 text-red-500">{error}</div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-gray-500">No conversations yet.</div>
                ) : (
                    <ul>
                        {conversations.map((convo) => (
                            <li
                                key={convo.user.user_id || convo.user.id}
                                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-100 transition ${selectedUser?.user_id === convo.user.user_id || selectedUser?.id === convo.user.id ? "bg-blue-100" : ""}`}
                                onClick={() => setSelectedUser(convo.user)}
                            >
                                <img
                                    src={convo.user.profile_picture || "/images/icon.jpg"}
                                    alt="profile"
                                    className="w-10 h-10 rounded-full object-cover border"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold">{convo.user.name || (convo.user.user_id || convo.user.id)?.slice(0, 6)}</div>
                                    <div className="text-xs text-gray-500 truncate">{convo.lastMessage}</div>
                                </div>
                                {convo.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{convo.unreadCount}</span>
                                )}
                                <div className="text-xs text-gray-400 ml-2">{new Date(convo.created_at).toLocaleString()}</div>
                            </li>
                        ))}
                    </ul>
                )}
                                    </div>
            {/* Chat Window */}
            <div className="flex-1 flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between gap-3 bg-gray-100">
                    {selectedUser && (
                        <>
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedUser.profile_picture || "/images/icon.jpg"}
                                    alt="profile"
                                    className="w-10 h-10 rounded-full object-cover border"
                                />
                                <div className="font-semibold text-lg">{selectedUser.name || (selectedUser.user_id || selectedUser.id)?.slice(0, 6)}</div>
                                    </div>
                            <button
                                onClick={() => openDeleteModal(selectedUser.user_id || selectedUser.id)}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2 px-3 py-2 rounded-full bg-white border border-red-200 shadow"
                                style={{ minWidth: '32px', minHeight: '32px', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Delete conversation"
                            >
                                🗑️
                            </button>
                        </>
                    )}
                                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        <div className="text-gray-500">Loading chat...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : chatMessages.length === 0 ? (
                        <div className="text-gray-500">No messages yet.</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {chatMessages.map((msg) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm ${
                                                isMe
                                                    ? "bg-blue-500 text-white self-end"
                                                    : "bg-white text-gray-800 self-start border"
                                            }`}
                                        >
                                            {msg.content}
                                            <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                );
                            })}
                                    </div>
                                )}
                            </div>
                {/* Message input */}
                {selectedUser && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default MyInbox;
