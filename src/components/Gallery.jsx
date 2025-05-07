import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

const Gallery = ({ userId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from("images")
                    .select("url")
                    .eq("user_id", userId);

                if (error) throw error;

                setImages(data.map((img) => img.url));
            } catch (err) {
                setError("Error fetching images. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchImages();
        }
    }, [userId]);

    return (
        <div className="max-w-5xl mx-auto p-6">
            {loading && <p className="text-gray-500">Loading images...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && images.length === 0 && (
                <p className="text-gray-600">No images uploaded yet.</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
