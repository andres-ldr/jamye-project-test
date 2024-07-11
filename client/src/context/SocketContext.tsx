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
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
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

  useEffect(() => {
    const socket = io('http://localhost:4000');
    setSocket(socket);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket.emit('joinRoom', params.id);

    socket.on('me', (id: string) => {
      setMe(id);
    });

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
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
        socket!.emit('answerCall', { signal: data, to: call.from });
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
        socket!.emit('callUser', {
          userToCall: id,
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
      socket!.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    window.location.reload();
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
