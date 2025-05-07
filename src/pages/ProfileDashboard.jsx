import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaPhone, FaUserTag, FaEdit } from "react-icons/fa";
import supabase from "../supabaseClient";
import Header from "../components/Header";
import HandleImage from "../components/HandleImage";
import { toast } from 'react-toastify';

function ProfileHeader({ userProfile, onEditPic, onShowModal }) {
    return (
        <div className="bg-gray-100 p-10 rounded-lg shadow-md max-w-7xl mx-auto mt-12 flex items-center space-x-8 relative">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg relative group">
                <img src={userProfile.profile_picture || "/images/icon.jpg"} alt="Profile" className="w-full h-full object-cover cursor-pointer" onClick={onShowModal} />
                <button
                    className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow group-hover:opacity-100 opacity-80 transition"
                    onClick={onEditPic}
                    title="Change picture"
                >
                    <FaEdit className="text-blue-600 text-xl" />
                </button>
            </div>
            <div>
                <h2 className="text-4xl font-bold text-gray-800">{userProfile.name}</h2>
                <p className="text-xl text-gray-500 mt-2">{userProfile.job || "No job specified"}</p>
                <p className="text-lg text-gray-600 mt-2">{userProfile.email}</p>
                {userProfile.created_at && (
                    <p className="text-sm text-gray-400 mt-1">Member since {new Date(userProfile.created_at).toLocaleDateString()}</p>
                )}
            </div>
        </div>
    );
}

function ProfileImages({ userId }) {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Images</h2>
            <HandleImage userId={userId} />
        </div>
    );
}

function ProfileDetails({ userProfile }) {
    return (
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { icon: FaUser, label: "Name", value: userProfile.name },
                    { icon: FaEnvelope, label: "Email", value: userProfile.email },
                    { icon: FaMapMarkerAlt, label: "Address", value: userProfile.address },
                    { icon: FaUserTag, label: "Role", value: userProfile.role?.charAt(0).toUpperCase() + userProfile.role?.slice(1) },
                    ...(userProfile.role === "worker"
                        ? [
                            { icon: FaBriefcase, label: "Job", value: userProfile.job },
                            { icon: FaPhone, label: "Phone", value: userProfile.phone },
                        ]
                        : []),
                    { icon: FaUser, label: "Description", value: userProfile.description || "No description provided" },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center bg-gray-100 p-5 rounded-lg shadow-md">
                        <Icon className="text-blue-500 text-2xl mr-4" />
                        <div>
                            <p className="text-gray-500 text-sm">{label}</p>
                            <p className="text-gray-800 font-semibold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfileEditForm({ userProfile, onChange, isUpdating }) {
    return (
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">Edit Profile <FaEdit className="text-blue-500" /></h2>
            <div className="space-y-6">
                {[
                    { label: "Name", name: "name" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Address", name: "address" },
                    { label: "Job", name: "job", show: userProfile.role === "worker" },
                    { label: "Phone", name: "phone", show: userProfile.role === "worker" },
                ].map(({ label, name, type = "text", show = true }) =>
                    show ? (
                        <div key={name} className="border-b pb-4 flex items-center gap-2">
                            <label className="block text-lg font-medium text-gray-700 flex-1">{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={userProfile[name] || ""}
                                onChange={onChange}
                                className="w-full p-4 mt-2 border border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex-1"
                            />
                            <FaEdit className="text-blue-400 ml-2" />
                        </div>
                    ) : null
                )}
                {/* Description */}
                <div className="border-b pb-4 flex items-center gap-2">
                    <label className="text-lg font-medium text-gray-700 flex-1">Description</label>
                    <textarea
                        name="description"
                        value={userProfile.description || ""}
                        onChange={onChange}
                        className="w-full p-4 mt-2 border border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex-1"
                    />
                    <FaEdit className="text-blue-400 ml-2" />
                </div>
            </div>
        </div>
    );
}

function ProfileDashboard() {
    const [userProfile, setUserProfile] = useState({
        name: "",
        job: "",
        address: "",
        email: "",
        role: "worker",
        phone: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPicInput, setShowPicInput] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const user = await supabase.auth.getUser();
            if (user?.data?.user) {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", user.data.user.id)
                    .single();
                if (error) {
                    setError(error.message);
                } else {
                    setUserProfile(data);
                }
            }
            setLoading(false);
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const reviewSubscription = supabase
            .channel('public:reviews')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, payload => {
                toast.info("A new review was posted!");
            })
            .subscribe();
        return () => {
            supabase.removeChannel(reviewSubscription);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserProfile((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        setError(null);
        try {
            const user = await supabase.auth.getUser();
            if (user?.data?.user) {
                const { error } = await supabase
                    .from("profiles")
                    .update(userProfile)
                    .eq("user_id", user.data.user.id);
                if (error) throw error;
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEditPic = () => setShowPicInput(true);
    const handlePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Upload logic here (e.g., to Supabase Storage)
        toast.info("Profile picture upload not implemented in this demo.");
        setShowPicInput(false);
    };

    return (
        <div className="min-h-screen h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                {/* Left: Profile + Images */}
                <div className="w-1/2 flex flex-col gap-8">
                    <div className="flex-1 flex items-center justify-center">
                        <ProfileHeader userProfile={userProfile} onEditPic={handleEditPic} onShowModal={() => setShowModal(true)} />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <ProfileImages userId={userProfile.user_id} />
                    </div>
                </div>
                {/* Right: Profile Details */}
                <div className="w-1/2 flex flex-col justify-center p-8">
                    <ProfileDetails userProfile={userProfile} />
                </div>
            </div>
            {/* Sticky Footer for Edit/Save/Cancel */}
            <div className="w-full bg-white border-t py-4 flex justify-center gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                                    onClick={handleUpdateProfile}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Updating..." : "Save Changes"}
                                </button>
                                <button
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
    );
}

export default ProfileDashboard;
