const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Store active users with their information
const activeUsers = new Map();

// Generate a token for a user
app.post('/token', (req, res) => {
  const { channelName, userName } = req.body;
  
  if (!channelName || !userName) {
    return res.status(400).json({ error: 'Channel name and user name are required' });
  }
  
  // Generate a unique UID for the user
  const uid = Math.floor(Math.random() * 1000000);
  
  // Store user information
  activeUsers.set(uid, {
    uid,
    userName,
    channelName,
    timestamp: Date.now()
  });
  
  console.log(`User ${userName} (${uid}) joined channel ${channelName}`);
  console.log('Active users:', Array.from(activeUsers.values()));
  
  // Generate token
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  
  res.json({ token, uid });
});

// Get users in a channel
app.get('/users/:channelName', (req, res) => {
  try {
    const { channelName } = req.params;
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }
    
    // Filter users by channel name
    const channelUsers = Array.from(activeUsers.values())
      .filter(user => user.channelName === channelName);
    
    console.log(`Users in channel ${channelName}:`, channelUsers);
    
    res.json({ users: channelUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a user when they leave
app.post('/leave', (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = activeUsers.get(uid);
    if (user) {
      console.log(`User ${user.userName} (${uid}) left channel ${user.channelName}`);
      activeUsers.delete(uid);
      console.log('Active users after removal:', Array.from(activeUsers.values()));
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to get all active users
app.get('/debug/users', (req, res) => {
  try {
    const allUsers = Array.from(activeUsers.values());
    console.log('All active users:', allUsers);
    res.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up inactive users (optional)
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
  
  for (const [uid, user] of activeUsers.entries()) {
    if (now - user.timestamp > inactiveThreshold) {
      console.log(`Removing inactive user ${user.userName} (${uid})`);
      activeUsers.delete(uid);
    }
  }
}, 60 * 1000); // Check every minute

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 