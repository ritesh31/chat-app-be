const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("We have a new connection !!!");

  // Join action for admin messages
  // Using socket.on server waiting for messages from client
  // This method for 'join' event
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    // Using socket.emit server sending messages to client
    socket.emit("message", {
      user: "admin",
      text: `${name}, Welcome to the ${room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${name} has joined !!!` });

    socket.join(user.room);

    callback();
  });

  // This method for 'sendMessage' event
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  // Disconnect action
  socket.on("disconnect", () => {
    console.log("User had left !!!");
  });
});

app.use(cors(router));

server.listen(PORT, () => console.log(`Server listing on port ${PORT}`));
