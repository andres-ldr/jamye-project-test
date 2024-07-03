import Notifications from '@/components/Notifications';
import Options from '@/components/Options';
import VideoPlayer from '@/components/VideoPlayer';
import React from 'react';

const page = () => {
  return (
    <div>
      <VideoPlayer />
      <Options>
        <Notifications />
      </Options>
    </div>
  );
};

export default page;
