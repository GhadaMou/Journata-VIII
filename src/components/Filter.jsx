import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/MyContext";

function FilterSection(props) {
    const [inputValue, setInputValue] = useState("");
    const [inputValue1, setInputValue1] = useState("");
    const { setTrade, setLocation } = useData();
    const navigate = useNavigate();

    const jobs = [
"Mason","Plumber","Electrician","Painter (building)","Tiler","Roofer","Carpenter","Locksmith","Drywall Installer (Plasterer)","Glazier","Steel Fixer (Rebar Worker)","Scaffolder","Floor and Wall Covering Installer","Auto Mechanic","Motorcycle Mechanic",
"Industrial Maintenance Technician","Appliance Repair Technician","Sanitary Equipment Installer","Bicycle Repairer","Metalworker / Metal Locksmith",
"Auto Body Technician (Panel Beater)","Cabinetmaker","Upholsterer","Parquet Floor Installer","Blacksmith","Stonecutter","Ornamental Plasterer (Staffer)","Stained Glass Maker","Decorative Painter","Ceramic Artist","Sculptor","Leatherworker","Engraver","Jeweler","Watchmaker","Fashion Designer / Pattern Maker",
"Tailor / Dressmaker","Garment Alteration Specialist","Embroiderer","Saddler","Weaver","Baker","Pastry Chef","Chocolatier","Butcher","Fishmonger","Cheesemaker","Ice Cream Maker","Gardener","Landscape Gardener","Tree Pruner / Arborist","Beekeeper","Market Gardener",
"Horticulturist","Delivery Driver","Warehouse Worker","Order Picker","Forklift Operator","Hairdresser","Beautician / Esthetician","Nail Technician",
"Massage Therapist","Home Helper / Domestic Worker","Cleaner / Cleaning Agent"];

    const locations = [
        "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", 
        "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", 
        "Kairouan", "Kasserine", "Sidi Bouzid", "Sfax", "Gabès", "Médenine", 
        "Tataouine", "Gafsa", "Tozeur", "Kebili"
    ];

    function handleInput(event){
        setInputValue(event.target.value);    
    }

    function handleInput1(event){
        setInputValue1(event.target.value);    
    }

    const handleClick = () => {
        setTrade(inputValue);
        setLocation(inputValue1);
        navigate("/app");
    };

    return (
        <div className={`h-full flex flex-col flex-1 sticky top-0 bg-gray-200 p-6 w-64 space-y-4 ${props.className || ''}`}>
            <h3 className="text-xl font-semibold text-gray-800">Find a worker</h3>
            <select
                value={inputValue}
                onChange={handleInput}
                className="p-3 border border-gray-300 rounded-lg"
            >
                <option value="">Select a service</option>
                {jobs.map((job, index) => (
                    <option key={index} value={job}>{job}</option>
                ))}
            </select>
            <select
                value={inputValue1}
                onChange={handleInput1}
                className="p-3 border border-gray-300 rounded-lg"
            >
                <option value="">Select a location</option>
                {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                ))}
            </select>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    onClick={handleClick}    
                    >
                        Apply filters
                    </button>
            <div className="flex-1"></div>
        </div>
    );
}

export default FilterSection;
