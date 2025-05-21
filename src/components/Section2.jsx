import { useData } from "../contexts/MyContext";
import { useState, useEffect } from "react";

function Section2() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Array of tradesperson-related images from Unsplash
    const slides = [
        {
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop&q=60",
            title: "Professional Plumbers",
            description: "Expert plumbing services for your home and business"
        },
        {
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60",
            title: "Skilled Electricians",
            description: "Safe and reliable electrical work by certified professionals"
        },
        {
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=60",
            title: "Expert Carpenters",
            description: "Custom woodwork and construction services"
        },
        {
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60",
            title: "Professional Painters",
            description: "Quality painting services for interior and exterior"
        }
    ];

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="min-h-screen flex flex-col justify-start items-center bg-gray-200 text-center p-6">
            {/* Upper content with 3 paragraphs side by side, separated by dark green lines */}
            <h2 className="text-3xl font-semibold mt-6"> Our Services</h2>
            <div className="flex flex-row justify-between items-center space-x-4 w-full max-w-4xl mt-4">
                <p className="text-gray-800 text-lg w-1/3">
                    We offer a variety of professional services to meet the needs of homeowners and businesses. Our team of experts ensures high-quality work for every project.
                </p>
                <div className="border-l-4 border-green-800 h-24"></div> {/* Green line */}
                <p className="text-gray-800 text-lg w-1/3">
                    Whether you need repairs, installations, or new constructions, our platform connects you with trusted professionals ready to help. Your satisfaction is our priority.
                </p>
                <div className="border-l-4 border-green-800 h-24"></div> {/* Green line */}
                <p className="text-gray-800 text-lg w-1/3">
                    Get in touch with a local expert today! We're here to provide solutions for your needs, with a focus on professionalism, reliability, and trust.
                </p>
            </div>

            {/* Main content */}
            <p className="text-gray-700 mt-4 max-w-2xl">
                We provide top-notch services to our clients with excellence and dedication.
            </p>

            {/* Slideshow */}
            <div className="relative w-full max-w-4xl mt-8">
                <div className="relative h-[400px] overflow-hidden rounded-lg shadow-xl">
                    {/* Slide */}
                    <div 
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{ opacity: 1 }}
                    >
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-6">
                            <h3 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h3>
                            <p className="text-lg">{slides[currentSlide].description}</p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition ${
                                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
        
    );
}

export default Section2;
