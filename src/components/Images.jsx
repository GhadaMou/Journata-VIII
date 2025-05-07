import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const Images = ({ userId }) => {
    const [newImage, setNewImage] = useState(null);
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch images associated with the logged-in user
    useEffect(() => {
        if (!userId) return;

        const fetchImages = async () => {
            const { data, error } = await supabase
                .from("images")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching images:", error);
                setError("Error fetching images");
            } else {
                setImages(data);
            }
        };

        fetchImages();
    }, [userId]);

    // Handle the file input change
    const handleFileChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    // Handle uploading the image
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!newImage) return;

        setIsUploading(true);
        setError(null);

        try {
            // Upload the image to the Supabase Storage bucket
            const { data, error: uploadError } = await supabase
                .storage
                .from("profile-images")
                .upload(`public/${userId}/${newImage.name}`, newImage);

            if (uploadError) throw uploadError;

            // Generate a public URL for the uploaded image
            const imageUrl = `https://jkribtpperjekmsmmtoi.supabase.co/storage/v1/object/public/profile-images/${data.path}`;

            // Store the image details in the images table
            const { error: insertError } = await supabase
                .from("images")
                .insert([{ user_id: userId, url: imageUrl }]);

            if (insertError) throw insertError;

            // Fetch updated images list
            const { data: imagesData, error: fetchError } = await supabase
                .from("images")
                .select("*")
                .eq("user_id", userId);

            if (fetchError) throw fetchError;

            setImages(imagesData);

            alert("Image uploaded successfully!");
            setNewImage(null);
        } catch (error) {
            setError(`Error: ${error.message}`);
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle deleting an image
    const handleImageDelete = async (imageId, imageUrl) => {
        try {
            // Delete image from Supabase Storage
            const { error: deleteError } = await supabase
                .storage
                .from("profile-images")
                .remove([imageUrl]);

            if (deleteError) throw deleteError;

            // Remove the image record from the database
            const { error: dbDeleteError } = await supabase
                .from("images")
                .delete()
                .eq("id", imageId);

            if (dbDeleteError) throw dbDeleteError;

            // Fetch updated images list
            const { data: imagesData, error: fetchError } = await supabase
                .from("images")
                .select("*")
                .eq("user_id", userId);

            if (fetchError) throw fetchError;

            setImages(imagesData);

            alert("Image deleted successfully!");
        } catch (error) {
            setError(`Error: ${error.message}`);
            console.error("Error deleting image:", error);
        }
    };

    return (
        <div className="space-y-8 mt-10">
            <h2 className="text-3xl font-semibold text-gray-800">Profile Images</h2>

            {/* Image Upload Form */}
            <div className="flex items-center space-x-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded-lg p-2"
                />
                <button
                    onClick={handleImageUpload}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload Image"}
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display Uploaded Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {images.length === 0 ? (
                    <p>No images uploaded yet.</p>
                ) : (
                    images.map((image) => (
                        <div
                            key={image.id}
                            className="relative bg-gray-100 rounded-lg shadow-md p-4"
                        >
                            <img
                                src={image.url}
                                alt="Profile"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => handleImageDelete(image.id, image.url)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                                <span className="text-xl">X</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Images;
