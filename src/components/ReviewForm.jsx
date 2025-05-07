import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function ReviewForm({ workerId, onClose }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);

    // ✅ Get the logged-in user correctly
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
            setError("You must be logged in to leave a review.");
            return;
        }

        if (!comment.trim()) {
            setError("Review cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from("reviews").insert([
                {
                    worker_id: workerId,
                    reviewer_id: user.id,
                    rating,
                    comment,
                },
            ]);

            if (error) throw error;

            setSuccess(true); // Show success message
            setComment("");
            setRating(5);

            // Close modal after success message
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

                <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Leave a Review</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating:</label>
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                            className="border p-2 w-full rounded"
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num} Star{num > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Comment:</label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review..."
                            className="border p-2 w-full rounded"
                        ></textarea>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">Review submitted successfully!</p>}

                    <button type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition w-full"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReviewForm;
