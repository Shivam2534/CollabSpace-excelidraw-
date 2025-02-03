import { useEffect, useState } from "react";
import { WS_BACKEND_URL } from "@repo/common/types";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BACKEND_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNjQ1ZTZhYi1hMjczLTRhZWQtODZkZS0yYTg5MDdiYTljNzQiLCJpYXQiOjE3MzgzMTY3NzN9.7h24DHMKI52HZgZHgAx9Was-1gP_FZG4PasmKeF0weU`
    );

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
  }, []);

  return { loading, socket };
}
