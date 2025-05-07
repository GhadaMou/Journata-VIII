import { createContext, useState, useContext, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import supabase from "../supabaseClient";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const MyContext = createContext();

function MyContextProvider({ children }) {
    const [trade, setTrade] = useState("");
    const [location, setLocation] = useState("");
    const [selected, setSelected] = useState(null);
    const [people, setPeople] = useState([]); // Initially empty, will be filled from Supabase
    const [reviews, setReviews] = useState([]); // All reviews

    // Fetch people from Supabase
    useEffect(() => {
        const fetchPeople = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, user_id, name, address, description, job, phone, profile_picture")
                .eq("role", "worker"); // Fetch only workers
        
            if (error) {
                console.error("Error fetching people:", error.message);
            } else {
                setPeople(data);
            }
        };

        fetchPeople();
    }, []); // Runs only once when component mounts

    // Fetch all reviews
    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("*");
            if (error) {
                console.error("Error fetching reviews:", error.message);
            } else {
                setReviews(data || []);
            }
        };
        fetchReviews();
    }, []);

    // Compute average rating for each worker and add to people
    const peopleWithAvgRating = people.map(person => {
        const workerReviews = reviews.filter(r => r.worker_id === person.user_id);
        const avgRating = workerReviews.length
            ? workerReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / workerReviews.length
            : 0;
        return { ...person, avgRating };
    });

    return (
        <MyContext.Provider
            value={{
                trade,
                people: peopleWithAvgRating,
                selected,
                location,
                setTrade,
                setSelected,
                setPeople,
                setLocation,
                reviews,
            }}
        >
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
        </MyContext.Provider>
    );
}

function useData() {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error("Context was used outside of the scope");
    }
    return context;
}

export { MyContextProvider, useData };
