import Peer from 'simple-peer';

export const createPeer = (userId, socket, stream) => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  peer.on('signal', (signal) => {
    socket.emit('callUser', {
      userToCall: userId,
      from: socket.id,
      signalData: signal,
    });
  });

  return peer;
};

export const acceptPeer = (signal, socket, stream) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream: stream,
  });

  peer.on('signal', (signal) => {
    socket.emit('acceptCall', { signal, to: socket.id });
  });

  peer.signal(signal);

  return peer;
};
