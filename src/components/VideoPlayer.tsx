'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useContext } from 'react';

const VideoPlayer = () => {
  const { stream, videoRef } = useContext(SocketContext);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default VideoPlayer;
