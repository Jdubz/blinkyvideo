import React from 'react';
import { useRef, useEffect } from 'react';
import './App.css';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideo = () => {
    return navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(stream => {
        const video = videoRef.current;
        
        if (video !== null) {
          video.srcObject = stream;
          video.play();
        } else {
          console.error('video is null');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  return (
    <div className="App">
      <video 
        ref={videoRef}
      />
    </div>
  );
}

export default App;
