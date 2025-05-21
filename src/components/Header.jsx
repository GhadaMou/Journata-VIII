import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import { useData } from "../contexts/MyContext";
import { FaBriefcase, FaUser, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import MyInbox from "./MyInbox";


function Header() {
    const navigate = useNavigate();
    const { } = useData();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);

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
    const closeInboxModal = () => setIsInboxModalOpen(false);

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
        navigate("/");
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
                { user ? (
                    <div className="text-white flex items-center space-x-4">
                        <span>Welcome, {userProfile ? userProfile.name : "Loading..."}</span>
                        <button
                className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
                onClick={navigateToProfile}
                >
                <FaUser /> My Profile
                </button>


                <button
                className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
                onClick={toggleInboxModal}
                >
                <FaEnvelope /> My Inbox
                </button>


                <button
                className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2"
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
                <MyInbox closeModal={closeInboxModal} />
            )}
        </header>
    );
}

export default Header;
