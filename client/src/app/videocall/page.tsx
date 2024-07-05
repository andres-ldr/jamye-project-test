'use client';
import Notifications from '@/components/Notifications';
import Options from '@/components/Options';
import VideoPlayer from '@/components/VideoPlayer';
import { SocketProvider } from '@/context/SocketContext';
import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io('http://localhost:4000');

const VideoCallPage = () => {
  useEffect(() => {
    const getSocketId = (id: string) => {
      console.log(id);
    };

    socket.on('me', getSocketId);

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>video call page</div>;
};

export default VideoCallPage;

/**
 *     <SocketProvider>
       <div>
        <VideoPlayer />
        <Options>
          <Notifications />
        </Options>
      </div> 
      <div></div>
    </SocketProvider>
 * 
 */
