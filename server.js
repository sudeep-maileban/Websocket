import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Relay ESP32 data to dashboard clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("Error:", err);
    }
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log("Client disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Smart Ambulance WebSocket Server is running!");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server live on port ${PORT}`));
