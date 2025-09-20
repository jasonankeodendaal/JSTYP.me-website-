import React, { useState } from 'react';

interface StarRatingProps {
    rating?: number;
    count?: number;
    value?: number;
    onChange?: (rating: number) => void;
    interactive?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; className?: string; onMouseEnter?: () => void; onClick?: () => void }> = ({ filled, className, ...props }) => (
    <svg 
        className={`w-6 h-6 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-600'} ${className}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating = 0, count, value = 0, onChange, interactive = false }) => {
    const [hoverValue, setHoverValue] = useState(0);

    // Display-only mode: Shows the average rating and total count.
    if (!interactive) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex">
                    {/* Render 5 stars, filling them based on the rounded average rating prop. */}
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < Math.round(rating)} className="text-yellow-400 w-5 h-5" />
                    ))}
                </div>
                {/* Optionally display the number of ratings if a count is provided. */}
                {count !== undefined && <span className="text-sm text-gray-400">({count} ratings)</span>}
            </div>
        );
    }
    
    // Interactive mode: Allows users to hover and click to set a rating.
    return (
        <div className="flex" onMouseLeave={() => setHoverValue(0)}>
            {[...Array(5)].map((_, i) => (
                <StarIcon
                    key={i}
                    // A star is filled if it's part of the current hover state or the selected value.
                    filled={i < (hoverValue || value)}
                    // Update hover state when the mouse enters a star to provide visual feedback.
                    onMouseEnter={() => setHoverValue(i + 1)}
                    // When a star is clicked, call the onChange callback with the new rating.
                    onClick={() => onChange?.(i + 1)}
                    className="transition-transform duration-200 hover:scale-125"
                />
            ))}
        </div>
    );
};

export default StarRating;