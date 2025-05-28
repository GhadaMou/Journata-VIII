import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/MyContext";

function Section1() {
    const [inputValue, setInputValue] = useState("");
    const { setTrade, setSelected } = useData();
    const navigate = useNavigate();

    const jobs = [
"Mason","Plumber","Electrician","Painter (building)","Tiler","Roofer","Carpenter","Locksmith","Drywall Installer (Plasterer)","Glazier","Steel Fixer (Rebar Worker)","Scaffolder","Floor and Wall Covering Installer","Auto Mechanic","Motorcycle Mechanic",
"Industrial Maintenance Technician","Appliance Repair Technician","Sanitary Equipment Installer","Bicycle Repairer","Metalworker / Metal Locksmith",
"Auto Body Technician (Panel Beater)","Cabinetmaker","Upholsterer","Parquet Floor Installer","Blacksmith","Stonecutter","Ornamental Plasterer (Staffer)","Stained Glass Maker","Decorative Painter","Ceramic Artist","Sculptor","Leatherworker","Engraver","Jeweler","Watchmaker","Fashion Designer / Pattern Maker",
"Tailor / Dressmaker","Garment Alteration Specialist","Embroiderer","Saddler","Weaver","Baker","Pastry Chef","Chocolatier","Butcher","Fishmonger","Cheesemaker","Ice Cream Maker","Gardener","Landscape Gardener","Tree Pruner / Arborist","Beekeeper","Market Gardener",
"Horticulturist","Delivery Driver","Warehouse Worker","Order Picker","Forklift Operator","Hairdresser","Beautician / Esthetician","Nail Technician",
"Massage Therapist","Home Helper / Domestic Worker","Cleaner / Cleaning Agent"];

    function handleInput(event){
        setInputValue(event.target.value);
    }

    const handleClick = () => {
        setTrade(inputValue);
        navigate("/app");
    };

    return (
        <section
            className="h-[60vh] flex items-center justify-center bg-cover bg-center p-6"
            style={{ backgroundImage: 'url(/images/bg.jpg)' }}
        >
            {/* Content centered both horizontally and vertically */}
            <div className="flex flex-col items-center space-y-6 max-w-2xl bg-opacity-50 bg-white p-6 rounded-lg text-center">
                <h2 className="text-3xl font-semibold text-gray-800">Find Trusted Tradespeople Near You</h2>
                <p className="text-gray-700 max-w-xl">
                    Searching for reliable and skilled tradespeople? Whether you need a plumber, electrician, or carpenter, our platform helps you connect with professionals in your area. Start your search below!
                </p>
                
                {/* Search Input and Button */}
                <div className="flex items-center space-x-4">
                    <select
                        value={inputValue}
                        onChange={handleInput}
                        className="p-3 w-80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a service</option>
                        {jobs.map((job, index) => (
                            <option key={index} value={job}>{job}</option>
                        ))}
                    </select>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            onClick={handleClick}
                    >
                        Search
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Section1;
