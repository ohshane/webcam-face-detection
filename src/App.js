import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import videoIcon from './icon/video.svg';
import personIcon from './icon/person.svg';

import '@mediapipe/face_detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as faceDetection from '@tensorflow-models/face-detection';

function App() {
  
  const videoRef = useRef(null);
  const intervalRef = useRef();
  const [play, setPlay] = useState(false);
  const [frame, setFrame] = useState(null);
  const [box, setBox] = useState({})
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoRef.current.srcObject = stream
      if (play) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    })
    .catch(error => {
      console.log(error)
    })
  }, [play, videoRef])

  function getFrame() {
    const canvas = document.createElement("canvas")
    canvas.setAttribute("style", "display: none;")
    const ctx = canvas.getContext("2d")
    canvas.width = 400
    canvas.height = 300
    ctx.drawImage(videoRef.current, 0, 0, 400, 300)
    // return canvas.toDataURL("image/jpeg")
    return canvas
  }

  useEffect(() => {
    if (play) {
      intervalRef.current = setInterval(() => {
        setFrame(getFrame())
      }, 200)
    } else {
      setFrame(null)
    }
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [play, videoRef])


  useEffect(() => {
    if (frame) {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: 'tfjs',
      };

      faceDetection.createDetector(model, detectorConfig)
      .then(detector => detector.estimateFaces(frame))
      .then(faces => faces[0].box)
      .then(face => setBox(face))
      .then(console.log)
      .catch(console.log)
    }
  }, [frame])

  return (
    <div className="App">
      <div className="container">
        {
          play && <div id="box" style={{ left: 400-box.xMax, top: box.yMin, width: box.width, height: box.height }}></div>
        }
        {
          (play) ? (
            <video ref={videoRef} onCanPlay={getFrame}></video>
          ) : (
            <img src={personIcon} alt="blank" />
          )
        }
      </div>
      <button onClick={() => setPlay(!play)} style={{ backgroundColor: play ? "lime" : "orangered" }} id="video_toggle">
        <img src={videoIcon} alt="video toggle button" />
      </button>
      <hr />
    </div>
  );
}

export default App;
