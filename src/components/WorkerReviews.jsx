import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function WorkerReviews({ workerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;

    const fetchReviews = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("worker_id", workerId);

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    fetchReviews();
  }, [workerId]);

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto space-y-3">
      {loading ? (
        <p className="text-center text-gray-500">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`p-4 rounded-md shadow bg-gray-50 border flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2 text-yellow-600 font-semibold text-base">
                <span>⭐ {review.rating} / 5</span>
              </div>
              <p className="text-gray-800 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No reviews yet for this worker.</p>
      )}
    </div>
  );
}

export default WorkerReviews;
