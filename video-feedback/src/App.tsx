import React from 'react';
import { useRef, useEffect, useState } from 'react';
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current === null) {
        return;
      }

      if (canvasRef.current === null) {
        return;
      }

      canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }, 33); // default to 30 fps
    return () => clearInterval(interval);
  }, [videoRef, canvasRef]);

  return (
    <div className="App">
      <video 
        ref={videoRef}
      />
      <canvas 
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
