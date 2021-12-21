import React, { useEffect, useState } from "react";
import DockerForm from "./DockerForm";
import WebsocketConnecter from "./WebsocketConnecter";
function App() {
  const [wsOpenCheck, setWsOpenCheck] = useState(false);
  const [ws, setWs] = useState<WebSocket>();
  useEffect(() => {
    console.log(ws);
    if (ws) {
      ws.onclose = () => {
        console.log("닫혀 버렸다 이기야~");
        setWsOpenCheck(false);
      };
      ws.onopen = () => {
        console.log("열려 버렸다 이기야~");
        setWsOpenCheck(true);
      };
    }
  }, [ws]);

  return (
    <div>
      {wsOpenCheck ? <DockerForm ws={ws} /> : <WebsocketConnecter wsOpenCheck={wsOpenCheck} ws={ws} setWs={setWs} />}
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
