import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import UserAvatar from './UserAvatar';

const VideoCall = () => {
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [channelUsers, setChannelUsers] = useState({});
  const refreshInterval = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const init = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setClient(client);
        console.log('Agora client created successfully');
      } catch (err) {
        console.error('Error creating Agora client:', err);
        setError('Failed to initialize Agora client');
      }
    };
    init();
  }, []);

  // Cleanup function to clear interval when component unmounts
  useEffect(() => {
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  // Fetch user information for the channel
  const fetchChannelUsers = async () => {
    if (!channelName) return;

    try {
      const response = await axios.get(`${API_URL}/users/${channelName}`);
      const { users } = response.data;

      if (!Array.isArray(users)) {
        console.error('Invalid users data received:', users);
        return;
      }

      // Create a map of uid to userName
      const userMap = {};
      users.forEach(user => {
        if (user && user.uid && user.userName) {
          userMap[user.uid] = user.userName;
        }
      });

      setChannelUsers(userMap);
    } catch (error) {
      console.error('Error fetching channel users:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  const joinChannel = async () => {
    if (!channelName || !userName) {
      setError('Please enter both channel name and your name');
      return;
    }

    try {
      setError(null);
      console.log('Joining channel:', channelName, 'as user:', userName);

      // Get token from server
      const response = await axios.post(`${API_URL}/token`, {
        channelName,
        userName,
      });
      const { token, uid } = response.data;
      setUserId(uid);
      console.log('Token received from server, UID:', uid);

      // Join the channel
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        channelName,
        token,
        uid
      );
      console.log('Joined channel successfully');

      // Fetch users in the channel
      await fetchChannelUsers();

      // Set up periodic refresh of channel users
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      refreshInterval.current = setInterval(fetchChannelUsers, 2000);

      // Create and publish local tracks
      try {
        console.log('Creating microphone and camera tracks...');
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        console.log('Tracks created successfully');

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Initialize isVideoOff state to false since camera is on by default
        setIsVideoOff(false);
        console.log('Initial camera state: enabled');

        console.log('Publishing tracks...');
        await client.publish([audioTrack, videoTrack]);
        console.log('Tracks published successfully');

        setIsJoined(true);
      } catch (trackError) {
        console.error('Error creating or publishing tracks:', trackError);
        setError(`Camera/microphone error: ${trackError.message}`);
        return;
      }

      // Handle remote users
      client.on('user-published', async (user, mediaType) => {
        console.log('Remote user published:', user.uid, mediaType);
        await client.subscribe(user, mediaType);
        console.log('Subscribed to remote user:', user.uid, mediaType);

        if (mediaType === 'video') {
          console.log('Adding remote user to state:', user.uid);
          setRemoteUsers((prevUsers) => {
            // Check if user already exists
            const exists = prevUsers.some(u => u.uid === user.uid);
            if (exists) {
              console.log('User already exists in state, updating...');
              return prevUsers.map(u => u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u);
            } else {
              console.log('Adding new user to state');
              return [...prevUsers, { ...user, videoTrack: user.videoTrack }];
            }
          });

          // Fetch updated user information when a new user joins
          await fetchChannelUsers();
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('Remote user unpublished:', user.uid, mediaType);

        if (mediaType === 'video') {
          // Only update the video track, keep the user in the array
          setRemoteUsers((prevUsers) => {
            return prevUsers.map(u => u.uid === user.uid ? { ...u, videoTrack: null } : u);
          });
        }

        // Fetch updated user information when a user's state changes
        fetchChannelUsers();
      });

      // Add handler for video track state changes
      client.on('user-updated', (user) => {
        console.log('User updated:', user.uid, 'Video enabled:', user.videoTrack?.enabled);
        setRemoteUsers(prevUsers =>
          prevUsers.map(u => u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u)
        );
      });

      // Add handler for when a user leaves the channel
      client.on('user-left', (user) => {
        console.log('Remote user left:', user.uid);
        // Remove the user from remoteUsers array
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
        // Fetch updated user information
        fetchChannelUsers();
      });
    } catch (error) {
      console.error('Error joining channel:', error);
      setError(`Failed to join channel: ${error.message}`);
    }
  };

  const leaveChannel = async () => {
    try {
      // Unpublish tracks before leaving
      if (localAudioTrack || localVideoTrack) {
        await client.unpublish([localAudioTrack, localVideoTrack].filter(Boolean));
        console.log('Unpublished local tracks');
      }

      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }

      // Clear the refresh interval
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }

      // Notify server that user is leaving
      if (userId) {
        try {
          await axios.post(`${API_URL}/leave`, { uid: userId });
        } catch (error) {
          console.error('Error notifying server about leaving:', error);
        }
      }

      await client.leave();
      setIsJoined(false);
      setRemoteUsers([]);
      setUserId(null);
      console.log('Left channel successfully');
    } catch (error) {
      console.error('Error leaving channel:', error);
      setError(`Failed to leave channel: ${error.message}`);
    }
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      try {
        // Toggle the mute state
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);

        // Apply the change to the track
        localAudioTrack.setEnabled(!newMuteState);
        console.log(`Microphone ${!newMuteState ? 'unmuted' : 'muted'}`);

        // Ensure this doesn't affect the video track
        if (localVideoTrack && localVideoTrack.enabled !== !isVideoOff) {
          localVideoTrack.setEnabled(!isVideoOff);
        }
      } catch (error) {
        console.error('Error toggling microphone:', error);
        // Revert the state if there was an error
        setIsMuted(!isMuted);
        setError(`Failed to toggle microphone: ${error.message}`);
      }
    } else {
      console.warn('Cannot toggle microphone: localAudioTrack is null');
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      try {
        // Toggle the video state
        const newVideoState = !isVideoOff;
        setIsVideoOff(newVideoState);

        // Apply the change to the track
        localVideoTrack.setEnabled(!newVideoState);
        console.log(`Camera ${!newVideoState ? 'turned on' : 'turned off'}`);
      } catch (error) {
        console.error('Error toggling video:', error);
        // Revert the state if there was an error
        setIsVideoOff(!isVideoOff);
        setError(`Failed to toggle video: ${error.message}`);
      }
    } else {
      console.warn('Cannot toggle video: localVideoTrack is null');
    }
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-8">Video Call</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!isJoined ? (
        <div className="join-form">
          <h2>Join Video Call</h2>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              id="userName"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
            <input
              id="channelName"
              type="text"
              placeholder="Enter channel name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <button onClick={joinChannel}>Join Channel</button>
        </div>
      ) : (
        <div className="video-container">
          <div className="local-video">
            {localVideoTrack ? (
              <div className="video-wrapper">
                {isVideoOff ? (
                  <div className="video-placeholder">
                    <UserAvatar name={userName} size="large" />
                    <div className="user-name-tag">{userName} (You)</div>
                  </div>
                ) : (
                  <>
                    <VideoPlayer track={localVideoTrack} isLocal={true} />
                    <div className="user-name-tag">{userName} (You)</div>
                  </>
                )}
              </div>
            ) : (
              <div className="video-placeholder">
                <UserAvatar name={userName} size="large" />
                <div className="user-name-tag">{userName} (You)</div>
              </div>
            )}
          </div>
          <div className="remote-videos">
            {remoteUsers.map((user) => {
              const remoteUserName = channelUsers[user.uid] || `Remote User ${user.uid}`;

              return (
                <div key={user.uid} className="video-wrapper">
                  {user.videoTrack && user.videoTrack.enabled !== false ? (
                    <>
                      <VideoPlayer track={user.videoTrack} isLocal={false} />
                      <div className="user-name-tag">{remoteUserName}</div>
                    </>
                  ) : (
                    <div className="video-placeholder">
                      <UserAvatar name={remoteUserName} size="large" />
                      <div className="user-name-tag">{remoteUserName}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="controls">
            <button onClick={toggleMute}>
              {isMuted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Unmute
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Mute
                </>
              )}
            </button>
            <button onClick={toggleVideo}>
              {isVideoOff ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Turn On Video
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Turn Off Video
                </>
              )}
            </button>
            <button onClick={leaveChannel}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 8a1 1 0 10-2 0v3a1 1 0 102 0v-3zm0-4a1 1 0 10-2 0v1a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              Leave Channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall; 