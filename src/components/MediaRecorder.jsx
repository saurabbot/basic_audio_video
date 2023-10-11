import React, { useState, useEffect, useRef, useCallback } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import { AudioVisualizer } from "react-audio-visualize";
import VideoRecorder from "./VideoRecorder";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

function App() {
  const initialState = {
    isRecording: false,
    blobURL: "",
    isBlocked: false,
  };
  const [state, setState] = useState(initialState);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [audios, setAudios] = useState([]);
  const [isSpecificAudioPlaying, setIsSpecificAudioPlaying] = useState(false);
  const _startTimer = useCallback(() => {
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  }, [setRecordingTime, setTimerInterval]);

  const _stopTimer = useCallback(() => {
    timerInterval != null && clearInterval(timerInterval);
    setRecordingTime(0);
    setTimerInterval(undefined);
  }, [timerInterval, setTimerInterval]);
  const startRecording = async () => {
    if (state.isBlocked) {
      alert("Permission Denied");
    }
    _startTimer();
    Mp3Recorder.start()
      .then(() => {
        setState({ isRecording: true });
      })
      .catch((e) => console.error(e));
  };
  const getAudioPermission = async () => {
    navigator.mediaDevices.getUserMedia(
      {
        audio: true,
      },
      () => {
        console.log("Permission Granted");
        setState({ isBlocked: false });
      },
      () => {
        console.log("Permission Denied");
        setState({ isBlocked: true });
      }
    );
  };
  const getVideoPermission = async () => {
    navigator.mediaDevices.getUserMedia(
      {
        video: true,
      },
      () => {
        console.log("Permission Granted");
        // setState({ isBlocked: false });
      },
      () => {
        console.log("Permission Denied");
        // setState({ isBlocked: true });
      }
    );
  };
  const stopRecording = async () => {
    _stopTimer();
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        console.log(blob);
        const blobURL = URL.createObjectURL(blob);
        setState({ blobURL, isRecording: false });
        setAudios((prev) => [
          ...prev,
          {
            url: blobURL,
            time: recordingTime,
          },
        ]);
      })
      .catch((e) => console.log(e));
  };
  const deleteCurrentRecording = () => {
    _stopTimer();
    setState({
      isRecording: false,
      blobURL: "",
    });
    Mp3Recorder.stop();
  };
  const playAudio = (audiofole) => {
    const audio = new Audio(audiofole);
    audio.play();
    setIsSpecificAudioPlaying(true);
    audio.onended = () => {
      setIsSpecificAudioPlaying(false);
    };
  };

  const startRecordingVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className=" bg-white p-4 h-screen items-center flex flex-col justify-end">
      <div className=" w-full flex flex-col">
        {audios.map((audio) => (
          <div
            className=" flex border m-3 justify-between duration-150 items-center border-black max-w-[500px]  p-3 text-black font-extrabold rounded-xl"
            onClick={() => {
              playAudio(audio.url);
            }}
          >
            <img
              src={
                isSpecificAudioPlaying
                  ? "https://img.icons8.com/?size=100&id=403&format=png"
                  : "https://img.icons8.com/?size=100&id=398&format=png"
              }
              className="w-9 h-9"
            />
            {Math.floor(audio.time / 60)}:
            {String(audio.time % 60).padStart(2, "0")}
          </div>
        ))}
      </div>
      <div className=" flex m-1 flex-row justify-between items-center rounded-full bg-black w-full">
        <div className="flex items-center">
          <VideoRecorder />
          {!state.isRecording ? (
            <button
              className=" bg-white rounded-full p-2 m-2 text-black"
              onClick={startRecording}
              disabled={state.isRecording}
            >
              <img
                src="https://img.icons8.com/?size=100&id=12653&format=png"
                className=" w-8 h-8"
              />
            </button>
          ) : (
            <button
              className=" bg-white rounded-full p-2 m-2 text-black"
              onClick={stopRecording}
              disabled={!state.isRecording}
            >
              <img
                src="https://img.icons8.com/?size=100&id=18765&format=png"
                className=" w-8 h-8"
              />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          {state.isRecording && (
            <button
              className=" bg-white rounded-full p-2 m-2 text-black"
              onClick={deleteCurrentRecording}
            >
              <img
                src="https://img.icons8.com/?size=48&id=KPhFC2OwpbWV&format=png"
                className=" w-8 h-8"
              />
            </button>
          )}
          {state.isRecording && (
            <span className=" text-white font-semibold text-xl mx-2">
              {Math.floor(recordingTime / 60)}:
              {String(recordingTime % 60).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
      {state.isBlocked && (
        <button onClick={getAudioPermission}>Get audio Permission</button>
      )}
    </div>
  );
}
export default App;
