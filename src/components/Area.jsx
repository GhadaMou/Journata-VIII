import { useState, useEffect } from "react";
import { useData } from "../contexts/MyContext";
import Rating from "./Rating";
import ReviewForm from "./ReviewForm";
import supabase from "../supabaseClient";

function Area() {
    const { selected } = useData();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [user, setUser] = useState(null);

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!selected) {
        return (
            <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">No person selected</h3>
                    <p className="text-gray-500">Please select a person from the list to see their details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-gray-50 rounded-lg shadow-md h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
                    {/* Profile Image */}
                    <div className="w-48 h-48 rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={selected.profile_picture || "/images/icon.jpg"}
                            alt={selected.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-semibold text-gray-800">{selected.name}</h4>
                        <p className="text-xl text-gray-600">{selected.job}</p>
                        <div className="mt-2">
                            <Rating rating={selected.rating} />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="text-lg font-medium text-gray-700 mb-2">Contact Information</h5>
                        <p className="text-gray-600"><span className="font-medium">Address:</span> {selected.address}</p>
                        <p className="text-gray-600">
                            <span className="font-medium">Phone:</span>{" "}
                            {user ? (
                                selected.phone
                            ) : (
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                    Please log in to see the phone number
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="text-lg font-medium text-gray-700 mb-2">About</h5>
                        <p className="text-gray-600">{selected.description}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex-1 max-w-xs mx-auto"
                        onClick={() => setShowReviewModal(true)}
                    >
                        Leave a Review
                    </button>
                </div>

                {/* Modals */}
                {showReviewModal && (
                    <ReviewForm
                        workerId={selected.user_id}
                        onClose={() => setShowReviewModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default Area;
