import { useEffect, useState } from "react";
import { WS_BACKEND_URL } from "@repo/common/types";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();
  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BACKEND_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3Y2E2MGE2Ny1mNjQ1LTQ5MDktOThmMS0xMTI0ZDIyOTM1N2QiLCJpYXQiOjE3NDAwNjQxOTh9.9Z6uTquasXypfloviJmqdoQ41-DiUSMgKpR8-BKKfJY`
    );
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
  }, []);

  return { loading, socket };
}

