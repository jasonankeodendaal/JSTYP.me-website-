import React from 'react';
import type { Video } from '../types';

interface VideoCardProps {
    video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    return (
        <div className="bg-[var(--card-color)]/50 backdrop-blur-sm border border-[var(--border-color)] rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:glow-effect aspect-video flex flex-col group">
            <div className="w-full h-full bg-black">
                {video.videoUrl && (
                    <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        loop
                        muted
                        playsInline
                        preload="metadata"
                    />
                )}
            </div>
            <div className="p-3 sm:p-4 text-center bg-black/30">
                <p className="text-gray-300 text-xs md:text-sm truncate" title={video.prompt}>{video.prompt}</p>
            </div>
        </div>
    );
};

export default VideoCard;
