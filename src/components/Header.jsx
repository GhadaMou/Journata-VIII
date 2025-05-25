import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import { useData } from "../contexts/MyContext";
import { FaBriefcase, FaUser, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaClipboardList } from "react-icons/fa";
import MyInbox from "./MyInbox";
import ServiceRequestsSection from "./ServiceRequestsSection";

function Header() {
    const navigate = useNavigate();
    const { } = useData();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
    const [isWorker, setIsWorker] = useState(false);
    const [showServiceRequestsPanel, setShowServiceRequestsPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("name, role")
                    .eq("user_id", user.id)
                    .single();

                if (error) {
                    console.log("Error fetching profile:", error);
                } else {
                    setUserProfile(data);
                    setIsWorker(data.role === 'worker');
                }
            }
        };
        fetchUser();
    }, []);

    // Real-time unread messages count
    useEffect(() => {
        if (!user) return;
        let messageSubscription;
        const fetchUnread = async () => {
            // If you have an is_read field, use it. Otherwise, count all messages where receiver_id = user.id and not opened in inbox.
            const { data, error } = await supabase
                .from("messages")
                .select("id")
                .eq("receiver_id", user.id)
                .is("is_read", false);
            setUnreadCount(data ? data.length : 0);
        };
        fetchUnread();
        messageSubscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
                fetchUnread();
            })
            .subscribe();
        return () => {
            if (messageSubscription) supabase.removeChannel(messageSubscription);
        };
    }, [user]);

    // Real-time pending service requests count (for workers)
    useEffect(() => {
        if (!user || !isWorker) return;
        let requestSubscription;
        const fetchPending = async () => {
            const { data, error } = await supabase
                .from("service_requests")
                .select("id")
                .eq("worker_id", user.id)
                .eq("status", "pending");
            setPendingRequestsCount(data ? data.length : 0);
        };
        fetchPending();
        requestSubscription = supabase
            .channel('public:service_requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, payload => {
                fetchPending();
            })
            .subscribe();
        return () => {
            if (requestSubscription) supabase.removeChannel(requestSubscription);
        };
    }, [user, isWorker]);

    const closeSignupModal = () => setIsSignupModalOpen(false);
    const closeLoginModal = () => setIsLoginModalOpen(false);
    const closeInboxModal = () => setIsInboxModalOpen(false);
    const closeServiceRequestsPanel = () => setShowServiceRequestsPanel(false);

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

    const toggleServiceRequestsPanel = () => {
        setShowServiceRequestsPanel((prev) => !prev);
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
                    className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2 relative"
                    onClick={() => navigate("/app")}
                >
                    <FaBriefcase /> Browse Offers
                </button>
                {user ? (
                    <div className="text-white flex items-center space-x-4">
                        <span>Welcome, {userProfile ? userProfile.name : "Loading..."}</span>
                        <button
                            className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2 relative"
                            onClick={navigateToProfile}
                        >
                            <FaUser /> My Profile
                        </button>

                        <button
                            className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2 relative"
                            onClick={toggleInboxModal}
                        >
                            <FaEnvelope /> My Inbox
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{unreadCount}</span>
                            )}
                        </button>

                        {isWorker && (
                            <div className="relative">
                                <button
                                    className="px-6 py-2 bg-black/5 text-white rounded-full font-medium tracking-wide hover:bg-black/15 transition flex items-center gap-2 relative"
                                    onClick={toggleServiceRequestsPanel}
                                >
                                    <FaClipboardList /> Service Requests
                                    {pendingRequestsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{pendingRequestsCount}</span>
                                    )}
                                </button>
                                {showServiceRequestsPanel && (
                                    <div className="fixed top-16 right-8 w-[700px] max-w-full z-50">
                                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                            <ServiceRequestsSection />
                                            <button
                                                onClick={closeServiceRequestsPanel}
                                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
                                                title="Close"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
