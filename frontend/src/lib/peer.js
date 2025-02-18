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
<<<<<<< HEAD
  });  peer.signal(incomingSignal);
=======
  });
  peer.signal(incomingSignal);
>>>>>>> 1e119ef7b2e8220ab76c4333f8e66cc6237d49e6
  return peer;
};
