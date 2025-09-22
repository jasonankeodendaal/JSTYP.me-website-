import React, { useState, useEffect } from 'react';

const phrases1 = [
    "AI-Powered Solutions",
    "Digital Transformation",
    "Scalable Architecture",
    "User-Centric Design",
    "Cloud Integration",
    "DevOps Excellence",
];

const phrases2 = [
    "Secure & Compliant",
    "Agile Development",
    "Data-Driven Insights",
    "API First Approach",
    "Performance Engineering",
    "Future-Proof Technology",
];

// Duplicate the phrases for a seamless loop
const duplicatedPhrases2 = [...phrases2, ...phrases2];

const animations = ['animate-typing', 'animate-flash', 'animate-fade'];

const ScrollingTextCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % phrases1.length);
        }, 4000); // Change phrase every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const currentPhrase = phrases1[currentIndex];
    const currentAnimation = animations[currentIndex % animations.length];

    return (
        <div className="w-full py-12 bg-[var(--background-color)] overflow-hidden font-mono uppercase">
            {/* Top Row - New Animated Text */}
            <div className="w-full text-center whitespace-nowrap mb-6 h-12 flex items-center justify-center">
                 <span key={currentIndex} className={`text-2xl md:text-3xl font-bold text-gray-500 ${currentAnimation}`}>
                    {currentPhrase}
                </span>
            </div>

            {/* Glowing Divider - New Equalizer */}
            <div className="w-full h-[20px] flex justify-center items-center my-4">
                 {Array.from({ length: 50 }).map((_, index) => (
                    <span
                        key={index}
                        className="equalizer-bar"
                        style={{ animationDelay: `${Math.random() * 1.5}s` }}
                    />
                ))}
            </div>

            {/* Bottom Row - Unchanged */}
            <div className="w-full flex animate-scroll-reverse whitespace-nowrap mt-6">
                {duplicatedPhrases2.map((phrase, index) => (
                    <span key={index} className="text-2xl md:text-3xl font-bold text-white text-glow mx-8">
                        {phrase}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ScrollingTextCarousel;
