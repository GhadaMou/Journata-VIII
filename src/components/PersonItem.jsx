import Rating from './Rating';
import { useData } from "../contexts/MyContext";  // Import your context hook

function WorkerCard({ person, onClick }) {
    // Use the average rating from reviews
    const rating = Number.isFinite(person.avgRating) ? Math.round(person.avgRating) : 0;

    return (
        <li 
            className="flex items-start space-x-4 p-4 bg-white shadow rounded-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl" 
            onClick={onClick}
        >
            {/* Image */}
            <img
                src={person.profile_picture || "/images/icon.jpg"}  // Use a default image if no image is provided
                alt={person.name}
                className="w-20 h-20 object-cover border border-gray-300"
            />

            {/* Person Info and Rating */}
            <div className="flex flex-col flex-grow">
                <h4 className="text-lg font-semibold text-gray-800">{person.name}</h4>
                <p className="text-gray-600">{person.job}</p>
                <p className="text-gray-500 text-sm">{person.address}</p>
            </div>

            {/* Rating in the top-right */}
            <div className="ml-4 flex-shrink-0 self-start" title={`Rating: ${rating} out of 5`}>
                <Rating rating={rating} />
            </div>
        </li>
    );
}

export default WorkerCard;
