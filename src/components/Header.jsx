import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import { useData } from "../contexts/MyContext";
import { FaBriefcase, FaUser, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";


function Header() {
    const navigate = useNavigate();
    const { setPeople, setSelected } = useData();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("name")
                    .eq("user_id", user.id)
                    .single();

                if (error) {
                    console.log("Error fetching profile:", error);
                } else {
                    setUserProfile(data);
                }
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchMessages = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from("messages")
                    .select("id, content, created_at, sender_id, receiver_id")
                    .eq("receiver_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching messages:", error.message);
                } else {
                    setMessages(data);
                }
                setLoading(false);
            };

            fetchMessages();
        }
    }, [user]);

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

    const closeSignupModal = () => setIsSignupModalOpen(false);
    const closeLoginModal = () => setIsLoginModalOpen(false);
    const closeInboxModal = () => {
        setIsInboxModalOpen(false);
        setReplyingTo(null);
        setReplyContent("");
    };

    const handleClick = () => {
        navigate("/");
    };

    const toggleSignupModal = () => {
        setIsSignupModalOpen(!isSignupModalOpen);
    };

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserProfile(null);
    };

    const handleLoginSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        const { data, error } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", user.id)
            .single();
        if (error) {
            console.log("Error fetching profile:", error);
        } else {
            setUserProfile(data);
        }
    };

    const navigateToProfile = () => {
        navigate("/profile");
    };

    const toggleInboxModal = () => {
        setIsInboxModalOpen(!isInboxModalOpen);
    };

    return (
        <header className="fixed top-0 left-0 w-full py-2 px-6 flex justify-between items-center shadow-md backdrop-blur-lg z-50 bg-gradient-to-r from-white via blue-400 via-blue-900 to-black">

            <h1 className="text-3xl font-extrabold text-white tracking-wide italic transform transition-all hover:scale-110 flex items-center gap-2 cursor-pointer" onClick={handleClick}>
                <div className="relative">
                    <div className="absolute inset-0 bg-white/40 blur-xl rounded-full scale-110"></div>
                    <img 
                        src="/images/logo.png" 
                        alt="Journata Logo" 
                        className="h-12 w-auto relative z-10 hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </h1>

            <nav className="flex space-x-6">
                    <button
                className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
                onClick={() => navigate("/app")}
                >
                <FaBriefcase /> Browse Offers
                        </button>


                {user ? (
                    <div className="text-white flex items-center space-x-4">
                        <span>Welcome, {userProfile ? userProfile.name : "Loading..."}</span>

                        <button
                className="px-4 py-1 bg-blue-500 text-white rounded-full font-medium tracking-wide hover:bg-blue-600 transition flex items-center gap-2"
                onClick={navigateToProfile}
                >
                <FaUser /> My Profile
                </button>


                <button
                className="px-4 py-1 bg-green-500 text-white rounded-full font-medium tracking-wide hover:bg-green-600 transition flex items-center gap-2"
                onClick={toggleInboxModal}
                >
                <FaEnvelope /> My Inbox
                </button>


                <button
                className="px-4 py-1 bg-red-500 text-white rounded-full font-medium tracking-wide hover:bg-red-600 transition flex items-center gap-2"
                onClick={handleLogout}
                >
                <FaSignOutAlt /> Log Out
                </button>

                    </div>
                ) : (
                    <>
                        <button
                            className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
                            onClick={toggleSignupModal}
                        >
                            <FaUserPlus />Sign Up
                        </button>
                        <button
                            className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
                            onClick={toggleLoginModal}
                        >
                            <FaSignInAlt />Log In
                        </button>
                    </>
                )}
            </nav>

            {/* Sign Up Modal */}
            {isSignupModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
                    onClick={closeSignupModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mt-[calc(100vh-10px)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SignupForm setUser={setUser} closeModal={closeSignupModal} />
                        <button
                            onClick={closeSignupModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Log In Modal */}
            {isLoginModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
                    onClick={closeLoginModal}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mt-[calc(100vh-10px)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LoginForm setUser={setUser} closeModal={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
                        <button
                            onClick={closeLoginModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Inbox Modal */}
            {isInboxModalOpen && (
                <div
                    className="absolute top-16 right-0 w-[350px] bg-white p-6 rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">My Inbox</h2>
                        <button
                            onClick={closeInboxModal}
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
                                    
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => setReplyingTo(msg)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
                                        >
                                            Reply to Message
                                        </button>
                                    </div>

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
            )}
        </header>
    );
}

export default Header;
