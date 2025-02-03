import { useEffect, useState } from "react";
import { WS_BACKEND_URL } from "@repo/common/types";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();
  useEffect(() => {
      const ws = new WebSocket(
        `${WS_BACKEND_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMmYxMTRhZi1iZWFmLTQwMGItOWVmZS02NmMwMmE2OWY2ZmIiLCJpYXQiOjE3Mzg1OTA3Njl9.2tjGirTJnU8IeidjJtFv5DO21idqnbUNnvMsTjpqu6k`
      );
      ws.onopen = () => {
        setLoading(false);
        setSocket(ws);
      };
  }, []);

  return { loading, socket };
}
