import React, { useState, useRef } from "react";

type Props = {};

const VideoRecorder = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const [mediaChunks, setMediaChunks] = useState<Blob[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const startRecording = async () => {
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      videoRef.current!.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          setMediaChunks((chunks) => [...chunks, e.data]);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(mediaChunks, { type: "video/webm" });
        setVideoBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (er) {
      console.error(er);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current!.stop();
    videoRef.current!.srcObject = null;
    mediaRecorderRef.current!.stop();
    setIsRecording(false);
  };

  function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  console.log(videoBlob);
  const convertBlobToBase64 = async () => {
    if (!videoBlob) return;
    const videoUrl = URL.createObjectURL(videoBlob);
    setVideoUrl(videoUrl);
  };
  return (
    <div className=" flex justify-center items-center rounded">
      {/* {!videoBlob ? ( */}
      <button onClick={startRecording}>
        <img
          src="https://img.icons8.com/?size=100&id=2926&format=png"
          className="bg-white w-11 h-11 m-2 rounded-full  text-black"
        />
      </button>
      {/* ) : ( */}
      {videoBlob && (
        <button
          className=" bg-white  text-black font-bold p-2"
          onClick={convertBlobToBase64}
        >
          <img
            src="https://img.icons8.com/?size=100&id=18765&format=png"
            className=" w-8 h-8"
          />
        </button>
      )}

      {/* )} */}

      {isRecording && (
        <div className=" absolute top-1 left-2 items-center w-full flex flex-col justify-center">
          <video ref={videoRef} autoPlay muted className=" w-1/2  rounded-xl" />
          <button
            className=" bg-black text-white p-2 rounded-md"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="absolute top-3 left-3 flex flex-col justify-center w-full">
          <video src={videoUrl} autoPlay controls className="  rounded-xl w-1/2" />
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
