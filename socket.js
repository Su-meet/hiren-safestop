const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      let name = data.name;
      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
        name: name,
        identification: data.identification,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("senddata", (data) => {
      let callerId = data.callerId;
      let officerId = data.officerId;
      socket.to(callerId).emit("receivedata", {
        callee: socket.user,
        officerId: officerId,
      });
    });

    socket.on("senddataofficer", (data) => {
      let callerId = data.callerId;
      let officerdata = data.officerdata;
      let ipAddress = data.ipAddress;
      let fcmtoken = data.fcmtoken;
      socket.to(callerId).emit("receivedataofficer", {
        callee: socket.user,
        officerId: officerdata,
        ipAddress: ipAddress,
        fcmtoken: fcmtoken,
      });
    });

    socket.on("endCall", (data) => {
      console.log("data:", data);
      let callerId = data.calleeId;
      console.log("endCall:", callerId);
      // rtcMessage = data.rtcMessage;

      socket.to(callerId).emit("callrejected", {
        callee: socket.user,
      });
    });

    socket.on("ICEcandidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      console.log("socket.user emit", socket.user);

      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};
