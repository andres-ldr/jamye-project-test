'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useContext } from 'react';

const VideoPlayer = () => {
  const { stream, myVideo } = useContext(SocketContext);

  return (
    <div className='grid grid-cols-2 gap-4'>
      {/* {stream && ( */}
        <div className='flex flex-col gap-4 border'>
          <video playsInline muted ref={myVideo} autoPlay className='' />
        </div>
       {/* )} */}
    </div>
  );
};

export default VideoPlayer;
