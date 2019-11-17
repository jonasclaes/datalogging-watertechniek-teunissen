import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { default as WebSocket } from "ws";
import app from "./app";

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || 3000;

/**
 * Create HTTP server.
 */
export const server = http.createServer(app);

/**
 * Create WebSocket server.
 */
export const wss = new WebSocket.Server({ server });

import "./websocket";

server.listen(port, function () {
    console.log("Server is up and running.");
});

export default server;