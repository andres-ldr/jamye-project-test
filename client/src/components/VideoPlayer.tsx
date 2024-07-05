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
  } = useContext(SocketContext);
  const context = useContext(SocketContext);

  return (
    <div className='grid grid-cols-2'>
      {stream && (
        <div className='flex flex-col gap-4'>
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
