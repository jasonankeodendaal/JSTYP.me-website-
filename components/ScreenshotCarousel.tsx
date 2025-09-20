
import React, { useState, useRef } from 'react';

interface ScreenshotCarouselProps {
    images: string[];
}

const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Use refs for touch handlers to avoid re-renders on move
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Reset endX on new touch
        touchEndX.current = 0;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        // Ensure there was a move
        if (touchStartX.current === 0 || touchEndX.current === 0) return;

        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // Threshold to prevent accidental swipes

        if (swipeDistance > minSwipeDistance) {
            goToNext(); // Swiped left
        } else if (swipeDistance < -minSwipeDistance) {
            goToPrevious(); // Swiped right
        }
        
        // Reset startX to avoid weird behavior on next touch
        touchStartX.current = 0;
    };


    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[9/16]">
            <div 
                className="relative h-full overflow-hidden rounded-xl border-4 border-gray-800"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div 
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((src, index) => (
                        <img 
                            key={index} 
                            src={src} 
                            alt={`Screenshot ${index + 1}`} 
                            className="w-full h-full object-cover flex-shrink-0"
                            draggable="false" // Prevent browser's default image drag behavior
                        />
                    ))}
                </div>
            </div>
            {/* Arrow buttons for desktop */}
            {images.length > 1 && (
                 <>
                    <button 
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-[-50px] -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors hidden md:block"
                        aria-label="Previous Screenshot"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        onClick={goToNext}
                        className="absolute top-1/2 right-[-50px] -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors hidden md:block"
                        aria-label="Next Screenshot"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}
            
            {/* Dots for navigation indication */}
            {images.length > 1 && (
                <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                currentIndex === index ? 'bg-orange-500' : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScreenshotCarousel;
