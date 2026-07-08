import { PUBLIC_SERVER_URL } from "$env/static/public";

type WsCallback = (data: Record<string, unknown>) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const listeners: Map<string, Set<WsCallback>> = new Map();

function getWsUrl(): string {
  const httpUrl = PUBLIC_SERVER_URL;
  return httpUrl.replace(/^http/, "ws") + "/ws";
}

function connect() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

  ws = new WebSocket(getWsUrl());

  ws.onopen = () => {
    console.log("[ws] connected");
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const type = msg.type as string;
      const cbs = listeners.get(type);
      if (cbs) {
        for (const cb of cbs) cb(msg as Record<string, unknown>);
      }
    } catch {}
  };

  ws.onclose = () => {
    console.log("[ws] disconnected, reconnecting in 3s...");
    ws = null;
    reconnectTimer = setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function subscribe(type: string, cb: WsCallback): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(cb);

  if (!ws && !reconnectTimer) connect();

  return () => {
    listeners.get(type)?.delete(cb);
  };
}

export function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  ws?.close();
  ws = null;
}
