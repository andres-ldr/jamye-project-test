import Notifications from '@/components/Notifications';
import Options from '@/components/Options';
import VideoPlayer from '@/components/VideoPlayer';
import WebCamCapture from '@/components/WebCamCapture';
import { SocketProvider } from '@/context/SocketContext';
import React, { useEffect, useState } from 'react';

const VideoCallPage = () => {
  return (
    <SocketProvider>
      <div className='flex flex-col gap-4'>
        {/* <WebCamCapture/> */}
        <VideoPlayer />
      </div>
    </SocketProvider>
  );
};

export default VideoCallPage;
