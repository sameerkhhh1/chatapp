let express = require("express");
let http = require("http");
let cors = require("cors");
let { Server } = require("socket.io");
const { text } = require("stream/consumers");
const { time } = require("console");

let app = express();

app.use(cors());

let server = http.createServer(app);

let io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("joinRoom", ({ username, roomid }) => {
    ((socket.username = username), (socket.roomid = roomid));
    socket.join(roomid);
    console.log(`${username} ${roomid}`);

    io.to(roomid).emit("message", {
      user: "System",
      text: `${username} joined the group`,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("sendMessage", (data) => {
    if (socket.roomid) {
      io.to(socket.roomid).emit("message", data);
    }
    console.log(data, "sendmsg data");
  });

  socket.on("typing", (username) => {
    if (socket.roomid) {
      socket.to(socket.roomid).emit("typing", username);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (socket.roomid) {
      io.to(socket.roomid).emit("message", {
        user: "system",
        text: `${socket.username} left the chat`,
        time: new Date().toLocaleTimeString(),
      });
    }
  });
});

server.listen(8080, () => {
  console.log("server is running at port 8080");
});
