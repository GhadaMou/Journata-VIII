import { useData } from "../contexts/MyContext";
import Rating from "./Rating";  // Import Rating component

function Preview() {
    const { selected } = useData();  // Get the selected person from the context

    if (!selected) {
        return (
            <div className="flex-grow p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800">No person selected</h3>
                <p className="text-gray-500">Please select a person from the list to see their details.</p>
            </div>
        );
    }

    return (
        <div className="flex-grow p-6 bg-gray-50 rounded-lg shadow-md">
            {/* Big Image */}
            <img
                src={selected.image || "/images/icon.jpg"}  // Use a default image if no image is available
                alt={selected.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
            />
            
            {/* Person Details */}
            <div className="flex flex-col items-start">
                <h4 className="text-2xl font-semibold text-gray-800">{selected.name}</h4>
                <p className="text-gray-600">{selected.job}</p>
                <p className="text-gray-500 text-sm">{selected.address}</p>
                
                {/* Rating */}
                <div className="mt-2">
                    <Rating rating={selected.rating} />
                </div>

                {/* Message Button */}
                <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Message this person
                </button>
            </div>
        </div>
    );
}

export default Preview;
