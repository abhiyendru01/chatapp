import Peer from "simple-peer";

export const createPeer = (userId, socket, stream) => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on("signal", (signal) => {
    socket.emit("callUser", { userToCall: userId, signal });
  });

  return peer;
};

export const acceptPeer = (incomingSignal, socket, stream) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,    stream,
  });
  peer.signal(incomingSignal);
  return peer;
};
