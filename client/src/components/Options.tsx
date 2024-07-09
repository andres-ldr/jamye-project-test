'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useContext, useEffect, useState } from 'react';

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
    setName,
    leaveCall,
    callUser,
  } = useContext(SocketContext);
  const [idToCall, setIdToCall] = useState('');

  useEffect(() => {
    if (me) {
      setIdToCall(me);
    }
  }, [me]);

  return (
    <div className='flex flex-col gap-10'>
      <form className='flex flex-col gap-4 py-2 px-4 border'>
        <label>Name</label>
        <input
          type='text'
          value={name}
          className='py-1 px-2 border rounded-md'
          onChange={(e) => setName(e.target.value)}
        />
        <label>Call To ID</label>
        <input
          type='text'
          value={idToCall!}
          onChange={(e) => setIdToCall(e.target.value)}
          className='py-1 px-2 border rounded-md'
        />
        {callAccepted && !callEnded ? (
          <button
            type='button'
            onClick={leaveCall}
            className='py-1 px-2 bg-red-500 rounded-md'
          >
            Hang Up
          </button>
        ) : (
          <button
            type='button'
            onClick={() => callUser(idToCall)}
            className='py-1 px-2 bg-blue-500 rounded-md'
          >
            Call
          </button>
        )}
      </form>
      {children}
    </div>
  );
};

export default Options;
