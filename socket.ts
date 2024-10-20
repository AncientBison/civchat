"use client";

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@lib/socketEndpoints";
import { io, Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
