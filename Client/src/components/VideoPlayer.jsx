import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ track, isLocal }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (track && videoRef.current) {
            // Always try to play the track, regardless of enabled state
            track.play(videoRef.current);

            // Add event listeners for track state changes
            track.on('track-ended', () => {
                console.log(`${isLocal ? 'Local' : 'Remote'} video track ended`);
            });

            track.on('track-enabled', () => {
                console.log(`${isLocal ? 'Local' : 'Remote'} video track enabled`);
            });

            track.on('track-disabled', () => {
                console.log(`${isLocal ? 'Local' : 'Remote'} video track disabled`);
            });
        }

        // Cleanup function to remove event listeners
        return () => {
            if (track) {
                track.stop();
                track.off('track-ended');
                track.off('track-enabled');
                track.off('track-disabled');
            }
        };
    }, [track, isLocal]);

    return (
        <div className="video-player" ref={videoRef}></div>
    );
};

export default VideoPlayer; 