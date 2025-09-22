import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import * as api from '../services/api';

export const useVideos = () => {
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null); // To track the ID of the video being generated

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getVideos();
            setVideos(data);
        } catch (error) {
            console.error("Failed to fetch videos", error);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const addVideo = useCallback(async (prompt: string) => {
        if (generating) {
            alert("Another video is already being generated. Please wait.");
            return;
        }

        try {
            const { video: initialVideo, operationName } = await api.generateVideo(prompt);
            setVideos(prev => (prev ? [initialVideo, ...prev] : [initialVideo]));
            setGenerating(initialVideo.id);

            const poll = setInterval(async () => {
                try {
                    const result = await api.checkVideoStatus(initialVideo.id, operationName);
                    if (result.status === 'completed' || result.status === 'failed') {
                        clearInterval(poll);
                        if (result.video) {
                           setVideos(prev => prev ? prev.map(v => v.id === initialVideo.id ? result.video! : v) : []);
                        } else {
                            // Handle failure case visually
                            setVideos(prev => prev ? prev.map(v => v.id === initialVideo.id ? {...v, status: 'failed'} : v) : []);
                        }
                        setGenerating(null);
                    }
                } catch (pollError) {
                    console.error("Polling error:", pollError);
                    clearInterval(poll);
                    setVideos(prev => prev ? prev.map(v => v.id === initialVideo.id ? {...v, status: 'failed'} : v) : []);
                    setGenerating(null);
                }
            }, 15000); // Poll every 15 seconds

        } catch (error) {
            console.error("Failed to start video generation", error);
            alert("Failed to start video generation. See console for details.");
            setGenerating(null);
        }
    }, [generating]);

    return { videos, addVideo, loading, generating };
};