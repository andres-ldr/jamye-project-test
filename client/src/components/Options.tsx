'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useContext, useState } from 'react';

interface OptionsProps {
  children: React.ReactNode;
}

const Options = ({ children }: OptionsProps) => {
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
  const [idToCall, setIdToCall] = useState('');

  return (
    <div>
      <span>{me}</span>
      {children}
    </div>
  );
};

export default Options;
