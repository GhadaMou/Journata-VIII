import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/"); // Not logged in
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      console.log("Profile fetch error:", error, "data:", data);
      if (error || !data || data.role !== "admin") {
        navigate("/"); // Not admin
        return;
      }
      setUserProfile(data);
      console.log("Fetched profile:", data);
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, email, role, created_at");
      if (!error) setUsers(data);
      setLoading(false);
    };
    if (userProfile && userProfile.role === "admin") {
      fetchUsers();
    }
  }, [userProfile]);

  if (!userProfile) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Admin Dashboard</h1>
        <p className="mb-8 text-gray-600">Welcome, {userProfile.name}!</p>
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Role</th>
                  <th className="py-2 px-4 border">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td className="py-2 px-4 border">{u.name}</td>
                    <td className="py-2 px-4 border">{u.email}</td>
                    <td className="py-2 px-4 border">{u.role}</td>
                    <td className="py-2 px-4 border">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 