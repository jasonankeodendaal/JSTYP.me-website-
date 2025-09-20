import React from 'react';

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
const duplicatedPhrases1 = [...phrases1, ...phrases1];
const duplicatedPhrases2 = [...phrases2, ...phrases2];

const ScrollingTextCarousel: React.FC = () => {
    return (
        <div className="w-full py-12 bg-[var(--background-color)] overflow-hidden font-mono uppercase">
            {/* Top Row */}
            <div className="w-full flex animate-scroll whitespace-nowrap mb-6">
                {duplicatedPhrases1.map((phrase, index) => (
                    <span key={index} className="text-2xl md:text-3xl font-bold text-gray-500 mx-8">
                        {phrase}
                    </span>
                ))}
            </div>

            {/* Glowing Divider */}
            <div className="w-full h-[2px] bg-orange-500 glow-effect my-4"></div>

            {/* Bottom Row */}
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