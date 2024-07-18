'use client';
import React, { createContext, useState, useRef, useEffect } from 'react';

interface SocketContextProps {
  stream: MediaStream | null;
  setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

const initialState: SocketContextProps = {
  stream: null,
  setStream: () => {},
  videoRef: { current: null },
};

const SocketContext = createContext<SocketContextProps>(initialState);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing the webcam', err);
      }
    };

    getVideo();
  }, []);

  const value = {
    stream,
    setStream,
    videoRef,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
