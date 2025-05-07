import { useData } from "../contexts/MyContext";
import WorkerCard from "./PersonItem";

function ScrollableResults() {
    const { trade, location, people, setSelected } = useData();

    // Filter by both trade and location if provided
    const filteredPeople = people.filter((person) => {
        const matchesTrade = trade ? person.job.toLowerCase() === trade.toLowerCase() : true;
        const matchesLocation = location ? person.address.toLowerCase() === location.toLowerCase() : true;
        return matchesTrade && matchesLocation;
    });

    // Always sort by avgRating descending
    const sortedPeople = [...filteredPeople].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

    return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                    {trade || location
                        ? `Found ${sortedPeople.length} worker(s) matching your filter`
                        : `Showing all ${sortedPeople.length} workers`}
                </h3>
            </div>

            {sortedPeople.length > 0 ? (
                <ul className="space-y-4">
                    {sortedPeople.map((person) => (
                        <WorkerCard key={person.id} person={person} onClick={() => setSelected(person)} />
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">
                    {trade || location ? "No matching workers found." : "No workers available."}
                </p>
            )}
        </div>
    );
}

export default ScrollableResults;
