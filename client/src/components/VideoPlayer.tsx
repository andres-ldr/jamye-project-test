'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { use, useContext, useEffect } from 'react';

const VideoPlayer = () => {
  const {
    name,
    call,
    myVideo,
    userVideo,
    stream,
    callAccepted,
    callEnded,
    me,
    setStream,
  } = useContext(SocketContext);

  useEffect(() => {
    const mediaStream = navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
          myVideo.current.onloadedmetadata = (e) => {
            myVideo.current!.play();
          };
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

    return () => {};
  }, [myVideo, setStream]);

  return (
    <div className='grid grid-cols-2 gap-4'>
      {stream && (
        <div className='flex flex-col gap-4 border'>
          <video playsInline muted ref={myVideo} autoPlay className='' />
          <span>{name}</span>
        </div>
      )}

      {callAccepted && !callEnded && (
        <div className='flex flex-col gap-4'>
          <video playsInline ref={userVideo} autoPlay className='' />
          <span>{call.name}</span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
