import { useState, useEffect } from "react";
import Gallery from "./Gallery";
import WorkerReviews from "./WorkerReviews";
import Rating from "./Rating";
import ReviewForm from "./ReviewForm";
import ServiceRequestForm from "./ServiceRequestForm";
import supabase from "../supabaseClient";
import { FaClipboardList, FaStar } from 'react-icons/fa6';

function WorkerDetailsPanel({ worker, workerId }) {
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!workerId) return;
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("worker_id", workerId);
      if (!error) setReviews(data || []);
    };
    fetchReviews();
  }, [workerId]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!worker) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center rounded-lg shadow-md">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800">No worker selected</h3>
          <p className="text-gray-500">Please select a worker to see their details.</p>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="flex-1 p-4 bg-white rounded-lg shadow-md h-full flex flex-col gap-6 overflow-y-auto min-h-0">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
          <img
            src={worker.profile_picture || "/images/icon.jpg"}
            alt={worker.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="text-2xl font-semibold text-gray-800">{worker.name}</h4>
        <p className="text-lg text-gray-600">{worker.job}</p>
        <div className="flex items-center gap-2 mt-1">
          <Rating rating={Math.round(avgRating)} />
          <span className="text-yellow-600 font-bold">{avgRating} / 5</span>
          <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Contact & About */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h5 className="text-lg font-medium text-gray-700 mb-2">Contact Information</h5>
          <p className="text-gray-600"><span className="font-medium">Address:</span> {worker.address}</p>
          <p className="text-gray-600">
            <span className="font-medium">Phone:</span>{" "}
            {user ? (
              worker.phone
            ) : (
              <span className="text-blue-600 cursor-pointer hover:underline">
                Please log in to see the phone number
              </span>
            )}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h5 className="text-lg font-medium text-gray-700 mb-2">About</h5>
          <p className="text-gray-600">{worker.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex-1 max-w-xs mx-auto flex items-center justify-center gap-2"
          onClick={() => setShowServiceRequestModal(true)}
        >
          <FaClipboardList className="text-lg" />
          Request Service
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex-1 max-w-xs mx-auto flex items-center justify-center gap-2"
          onClick={() => setShowReviewModal(true)}
        >
          <FaStar className="text-lg" />
          Leave a Review
        </button>
      </div>

      {/* Modals */}
      {showReviewModal && (
        <ReviewForm workerId={worker.user_id} onClose={() => setShowReviewModal(false)} />
      )}
      {showServiceRequestModal && (
        <ServiceRequestForm workerId={worker.user_id} onClose={() => setShowServiceRequestModal(false)} />
      )}

      {/* Gallery */}
      <div>
        <h5 className="text-lg font-medium text-gray-700 mb-2">Gallery</h5>
        <Gallery userId={worker.user_id} />
      </div>
    </div>
  );
}

export default WorkerDetailsPanel; 