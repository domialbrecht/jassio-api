module.exports = (io, socket) => {
  const log = (payload) => {
    console.log(payload);
    socket.broadcast.emit("chat message", payload);
  };
  socket.on("chat message", log);
};
