import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useData } from "../contexts/MyContext";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

function Section3() {
  const { setLocation } = useData();
  const navigate = useNavigate();

  const cities = [
    { name: 'Tataouine', position: [33.00, 10.45] },
    { name: 'Medenine', position: [33.35, 10.50] },
    { name: 'Djerba', position: [33.83, 11.00] },
  ];

  const handleMarkerClick = (cityName) => {
    setLocation(cityName);
    navigate("/app");
  };

  const Centerer = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (map) map.setView(center);
    }, [center, map]);
    return null;
  };

  const paragraphs = [
    {
      text: "With our interactive map, you can easily find skilled tradespeople near you. Whether you're looking for a plumber to fix a leak, an electrician for a home upgrade, or a carpenter to craft custom furniture, our platform allows you to explore available professionals based on your location. Simply click on a city or town to view a list of qualified experts ready to take on your project.",
    },
    {
      text: "Searching for a tradesperson has never been easier. Our website connects you to local professionals in various trades, allowing you to browse through ratings, reviews, and past work. By using the interactive map, you can quickly pinpoint tradespeople in your area and make informed decisions based on their experience and customer feedback.",
    },
    {
      text: "Looking for reliable tradespeople is now just a click away. Our site helps you locate professionals across different fields, from plumbing to electrical services. Using the interactive map, you can zoom in on your area, explore options, and get in touch with experts who can handle your specific needs. Save time and effort by finding the right professional for your home improvement or repair project.",
    },
  ];

  const [currentParagraph, setCurrentParagraph] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentParagraph((prevIndex) => (prevIndex + 1) % paragraphs.length);
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative z-0 w-full flex flex-col md:flex-row items-center justify-center bg-gray-100 py-10 px-4 gap-8">
      
      {/* Map Container fixed size */}
      <div className="w-full md:w-[1200px] h-[400px] rounded-lg shadow-lg overflow-hidden">
        <MapContainer
          className="w-full h-full"
          center={[33.50, 10.75]}
          zoom={9}
          scrollWheelZoom={false}
        >
          <Centerer center={[33.50, 10.75]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cities.map((city) => (
            <Marker
              key={city.name}
              position={city.position}
              eventHandlers={{
                click: () => handleMarkerClick(city.name),
              }}
            >
              <Popup>
                {city.name} <br />
                Click to explore more!
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Paragraph */}
      <div className="w-full md:w-[400px] h-[400px] p-6 bg-blue-100 rounded-lg shadow-lg text-left">
        <h2 className="text-2xl mb-4 text-blue-600">Looking for people nearby!</h2>
        <p className="transition duration-500 text-gray-700">
          {paragraphs[currentParagraph].text}
        </p>
      </div>
    </section>
  );
}

export default Section3;
