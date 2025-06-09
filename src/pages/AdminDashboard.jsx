import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [searchReviews, setSearchReviews] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [currentPageReviews, setCurrentPageReviews] = useState(1);
  const usersPerPage = 5;
  const reviewsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, role")
        .eq("user_id", user.id)
        .single();

      if (error || !data || data.role !== "admin") {
        navigate("/");
        return;
      }

      setUserProfile(data);
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchUsersAndReviews = async () => {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("user_id, name, role, created_at");

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          comment,
          created_at,
          reviewer:reviewer_id (
            user_id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (usersError) {
        toast.error("Error loading users", {
          style: { backgroundColor: "#f87171", color: "#fff" },
        });
      }

      if (reviewsError) {
        toast.error("Error loading reviews", {
          style: { backgroundColor: "#f87171", color: "#fff" },
        });
      }

      setUsers(usersData || []);
      setReviews(reviewsData || []);
      setLoading(false);
    };

    if (userProfile && userProfile.role === "admin") {
      fetchUsersAndReviews();
    }
  }, [userProfile]);

  const handleDeleteUser = async (userId, role) => {
    if (role === "admin") {
      toast.warning("You cannot delete an admin!", {
        style: { backgroundColor: "#fbbf24", color: "#000" },
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);

    if (error) {
      toast.error("Failed to delete user: " + error.message, {
        style: { backgroundColor: "#f87171", color: "#fff" },
      });
      return;
    }

    setUsers(users.filter((u) => u.user_id !== userId));
    toast.success("User deleted successfully!", {
      style: { backgroundColor: "#34d399", color: "#fff" },
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      toast.error("Failed to delete review: " + error.message, {
        style: { backgroundColor: "#f87171", color: "#fff" },
      });
      return;
    }

    setReviews(reviews.filter((r) => r.id !== reviewId));
    toast.success("Review deleted successfully!", {
      style: { backgroundColor: "#34d399", color: "#fff" },
    });
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReviews = reviews.filter((r) =>
    r.reviewer?.name?.toLowerCase().includes(searchReviews.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchReviews.toLowerCase())
  );

  const indexOfLastUser = currentPageUsers * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const indexOfLastReview = currentPageReviews * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  const paginateUsers = (pageNumber) => setCurrentPageUsers(pageNumber);
  const paginateReviews = (pageNumber) => setCurrentPageReviews(pageNumber);

  if (!userProfile) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Admin Dashboard</h1>
        <p className="mb-6 text-gray-600">Welcome, {userProfile.name}!</p>

        {/* USERS SECTION */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-4 py-2 border rounded w-full"
          />
          {loading ? (
            <div>Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Name</th>
                    <th className="py-2 px-4 border text-left">Role</th>
                    <th className="py-2 px-4 border text-left">Registered At</th>
                    <th className="py-2 px-4 border text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u) => (
                    <tr key={u.user_id}>
                      <td className="py-2 px-4 border">{u.name}</td>
                      <td className="py-2 px-4 border">{u.role}</td>
                      <td className="py-2 px-4 border">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border text-right">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteUser(u.user_id, u.role)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4 space-x-2">
                {[...Array(Math.ceil(filteredUsers.length / usersPerPage)).keys()].map(
                  (n) => (
                    <button
                      key={n + 1}
                      onClick={() => paginateUsers(n + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPageUsers === n + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {n + 1}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* REVIEWS SECTION */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Reviews</h2>
          <input
            type="text"
            placeholder="Search by name or comment..."
            value={searchReviews}
            onChange={(e) => setSearchReviews(e.target.value)}
            className="mb-4 px-4 py-2 border rounded w-full"
          />
          {reviews.length === 0 ? (
            <p>No reviews available.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {currentReviews.map((review) => (
                  <li
                    key={review.id}
                    className="border p-4 rounded shadow-sm bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {review.reviewer?.name || "Unknown user"}
                        </p>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center mt-4 space-x-2">
                {[...Array(Math.ceil(filteredReviews.length / reviewsPerPage)).keys()].map(
                  (n) => (
                    <button
                      key={n + 1}
                      onClick={() => paginateReviews(n + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPageReviews === n + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {n + 1}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
