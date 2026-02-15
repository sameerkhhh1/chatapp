import "./App.css";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

function App() {
  const [roomid, setRoomID] = useState("");
  const [username, setUserName] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState("");
  const [messageArray, setMessageArray] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("typing", (name) => {
      setTyping(`${name} is typing...`);
      setTimeout(() => setTyping(""), 1500);
    });

    socket.on("message", (data) => {
      setMessageArray((prev) => [...prev, data]);
    });

    return () => {
      socket.off("typing");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageArray]);

  function handleJoin() {
    if (username.trim() && roomid.trim()) {
      socket.emit("joinRoom", { username, roomid });
      setJoined(true);
    }
  }

  function handleSendMessage() {
    if (message.trim()) {
      socket.emit("sendMessage", {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setMessage("");
    }
  }

  function handleTyping(e) {
    setMessage(e.target.value);
    socket.emit("typing", username);
  }

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-box">
          <h2>Join Chat</h2>
          <input
            className="input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Enter room id"
            value={roomid}
            onChange={(e) => setRoomID(e.target.value)}
          />
          <button className="btn" onClick={handleJoin}>
            JOIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Room: {roomid}</h3>
      </div>

      <div className="chat-messages">
        {messageArray.map((el, idx) => (
          <div
            key={idx}
            className={el.user === username ? "message own" : "message"}
          >
            <div className="message-user">{el.user}</div>
            <div className="message-text">{el.text}</div>
            <div className="message-time">{el.time}</div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="typing">{typing}</div>

      <div className="chat-input">
        <input
          className="input"
          value={message}
          placeholder="Enter message"
          onChange={handleTyping}
        />
        <button className="btn" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
