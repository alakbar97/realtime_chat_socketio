const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  getCurrentUser,
  userJoin,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

//Runs when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // sending to the client
    socket.emit("message", formatMessage("Bot", "Welcome to Chat Cord !"));

    // sending to all clients except sender
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Bot", `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listens for chat message
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.emit("message", formatMessage(user.username, message));
  });

  // runs when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Bot", `${user.username} has left the chat !`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is up on ${PORT}`);
});
