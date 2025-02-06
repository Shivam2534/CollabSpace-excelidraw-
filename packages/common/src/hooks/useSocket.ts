import { useEffect, useState } from "react";
import { WS_BACKEND_URL } from "@repo/common/types";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();
  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BACKEND_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOWQ1OTc0YS0xN2U5LTQ4ODEtODMwMy1hYzNlMjM5OWY0NTMiLCJpYXQiOjE3Mzg3NjI1MDR9.IKSd8LLGiGFVf9rE1mkZXc2cvzRPh0pW_tEtUVRbEIo`
    );
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
  }, []);

  return { loading, socket };
}
