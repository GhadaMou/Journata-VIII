import { useState, useEffect } from "react";
import supabase from "../supabaseClient"; // Import Supabase client

const HandleImage = ({ userId }) => {
  const [imageUrls, setImageUrls] = useState([]); // Store all user images
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch images for the authenticated user
  useEffect(() => {
    const fetchImages = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("images")
        .select("url")
        .eq("user_id", userId);

      if (error) {
        setError("Failed to load images");
        console.error(error);
      } else {
        setImageUrls(data.map((img) => img.url)); // Extract URLs
      }
    };

    fetchImages();
  }, [userId]);

  // Function to handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const filePath = `user-images/${userId}/${file.name}`; // Define the storage path

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Retrieve the public URL
      const { data } = supabase.storage.from("user-images").getPublicUrl(filePath);
      const publicURL = data?.publicUrl;

      if (!publicURL) {
        throw new Error("Failed to retrieve public URL");
      }

      // Store the public URL in the database
      const { error: dbError } = await supabase
        .from("images")
        .insert([{ user_id: userId, url: publicURL }]);

      if (dbError) throw dbError;

      // Update the state to show the new image
      setImageUrls((prevUrls) => [...prevUrls, publicURL]);
      alert("Image uploaded successfully!");
    } catch (err) {
      setError(`Error uploading image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Function to delete an image
  const handleDeleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    const filePath = imageUrl.split("/").slice(-2).join("/"); // Extract correct file path
    try {
      // Remove from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("user-images")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Remove from Database
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .match({ url: imageUrl });

      if (dbError) throw dbError;

      // Update state to remove deleted image
      setImageUrls((prevUrls) => prevUrls.filter((url) => url !== imageUrl));
      alert("Image deleted successfully!");
    } catch (err) {
      setError(`Error deleting image: ${err.message}`);
    }
  };

  // Function to set an image as profile picture
  const handleSetAsProfilePicture = async (imageUrl) => {
    if (!imageUrl || !userId) return;

    try {
      // Update the profile picture in the profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture: imageUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      alert("Profile picture updated successfully!");
    } catch (err) {
      setError(`Error setting profile picture: ${err.message}`);
    }
  };

  return (
    <div className="my-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Profile Images</h2>

      {/* Display Uploaded Images */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg shadow" />
              <div className="absolute top-1 right-1 flex space-x-1">
                <button
                  onClick={() => handleSetAsProfilePicture(url)}
                  className="bg-green-500 text-white text-xs p-1 rounded hover:bg-green-600"
                  title="Set as Profile Picture"
                >
                  👤
                </button>
                <button
                  onClick={() => handleDeleteImage(url)}
                  className="bg-red-500 text-white text-xs p-1 rounded hover:bg-red-600"
                  title="Delete Image"
                >
                  ❌
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No images uploaded yet.</p>
        )}
      </div>

      {/* Image Upload */}
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4 cursor-pointer"
      />
      {uploading && <p>Uploading...</p>}

      {/* Error Handling */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default HandleImage;
