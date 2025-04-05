import React from 'react';
import VideoCall from './components/VideoCall';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Mate</h1>
      </header>
      <main>
        <VideoCall />
      </main>
    </div>
  );
}

export default App; 