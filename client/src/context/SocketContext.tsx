'use client';
import React, { createContext, useState, useRef, useEffect } from 'react';

interface SocketContextProps {
  stream: MediaStream | null;
  setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
}

const initialState: SocketContextProps = {
  stream: null,
  setStream: () => {},
  myVideo: { current: null },
};

const SocketContext = createContext<SocketContextProps>(initialState);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const myVideo = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    navigator.mediaDevices
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

    return () => {
      // if (stream) {
      //   stream.getTracks().forEach((track) => track.stop());
      // }
    };
  }, [myVideo]);

  const value = {
    stream,
    setStream,
    myVideo,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
