import React, { useEffect, useState } from "react";
import OpenedWebsocket from "./OpenedWebsocket";
import WebsocketConnecter from "./WebsocketConnecter";
import TransferMessage from "./TransferMessage";
function App() {
  const [wsOpenCheck, setWsOpenCheck] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket>();
  useEffect(() => {
    console.log(ws);
    if (ws) {
      ws.onclose = () => {
        console.log("소켓 연결 종료");
        setWsOpenCheck(false);
      };
      ws.onopen = () => {
        console.log("소켓 연결 완료");
        setWsOpenCheck(true);
      };
    }
  }, [ws]);

  return (
    <div>
      {wsOpenCheck ? (
        <OpenedWebsocket ws={ws} />
      ) : (
        <WebsocketConnecter wsOpenCheck={wsOpenCheck} ws={ws} setWs={setWs} />
      )}
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
