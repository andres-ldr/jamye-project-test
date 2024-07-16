'use client';
import React, { createContext, useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { useParams } from 'next/navigation';

interface SocketContextProps {
  stream: MediaStream | null;
  me: string | null;
  userToCall: string | null;
  call: {
    isReceivingCall: boolean;
    from: string;
    name: string;
    signal: any;
  };
  callAccepted: boolean;
  callEnded: boolean;
  name: string;
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
  userVideo: React.MutableRefObject<HTMLVideoElement | null>;
  connectionRef: React.MutableRefObject<Peer.Instance | null>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  answerCall: () => void;
  callUser: (id: string) => void;
  leaveCall: () => void;
}

const initialState: SocketContextProps = {
  stream: null,
  me: null,
  userToCall: null,
  call: {
    isReceivingCall: false,
    from: '',
    name: '',
    signal: null,
  },
  callAccepted: false,
  callEnded: false,
  name: '',
  myVideo: { current: null },
  userVideo: { current: null },
  connectionRef: { current: null },
  setName: () => {},
  answerCall: () => {},
  callUser: () => {},
  leaveCall: () => {},
};

const SocketContext = createContext<SocketContextProps>(initialState);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const params = useParams();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [userToCall, setUserToCall] = useState<string | null>(null);
  const [call, setCall] = useState({
    isReceivingCall: false,
    from: '',
    name: '',
    signal: null,
  });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');
  const [socket, setSocket] = useState<Socket>();
  const [members, setMembers] = useState<string[]>([]);

  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
          myVideo.current.onloadedmetadata = (e) => {
            myVideo.current!.play();
          };
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getMediaStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

    setSocket(socket);

    socket.emit('joinRoom', params.id);

    socket.on('me', (id: string) => {
      setMe(id);
    });

    // Listen for incoming calls and get data from the caller
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      // from: socket id of the caller
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      connectionRef.current?.destroy;
      window.location.reload();
    });

    return () => {
      socket.emit('leaveRoom', params.id);
      socket.disconnect();
    };
  }, [params.id]);

  useEffect(() => {
    if (socket && me) {
      socket.emit('getRoomConnections', params.id);
      socket.on('roomConnections', (connections: string[]) => {
        setMembers(connections);
        const userToCall = connections.find((id) => id !== me);
        if (userToCall) setUserToCall(userToCall);
      });
    }
  }, [me, params.id, socket, members]);

  const answerCall = () => {
    setCallAccepted(true);
    if (stream) {
      const peer = new Peer({ initiator: false, trickle: false, stream });
      peer.on('signal', (data) => {
        // emit callee's data to the caller
        // to: caller's socket id
        socket!.emit('answerCall', { signal: data, to: call.from, name });
      });
      peer.on('stream', (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });

      if (call.signal) {
        peer.signal(call.signal);
      }

      connectionRef.current = peer;
    }
  };

  const callUser = (id: string) => {
    if (stream) {
      const peer = new Peer({ initiator: true, trickle: false, stream });

      peer.on('signal', (data) => {
        // emit caller's data to the callee
        socket!.emit('callUser', {
          userToCall: id, // callee's socket id
          signalData: data,
          from: me,
          name,
        });
      });
      peer.on('stream', (currentStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }
      });
      socket!.on('callAccepted', ({ signal, name }) => {
        setCallAccepted(true);
        setCall({ isReceivingCall: false, from: id, name, signal });
        peer.signal(signal);
      });

      connectionRef.current = peer;
    }
  };

  const leaveCall = () => {
    socket!.emit('callEnded', { room: params.id });
  };

  const value = {
    stream,
    me,
    userToCall,
    call,
    callAccepted,
    callEnded,
    name,
    myVideo,
    userVideo,
    connectionRef,
    setName,
    answerCall,
    callUser,
    leaveCall,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };
