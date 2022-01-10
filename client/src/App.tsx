import React, { useEffect, useState } from "react";
import OpenedWebsocket from "./components/OpenedWebsocket";
import WebsocketConnecter from "./components/WebsocketConnecter";
import TransferMessage from "./components/TransferMessage";
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
  const onServerTest = () => {
    fetch("http://localhost:3001/")
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  return (
    <div>
      {wsOpenCheck ? (
        <OpenedWebsocket ws={ws} />
      ) : (
        <WebsocketConnecter wsOpenCheck={wsOpenCheck} ws={ws} setWs={setWs} />
      )}
      <div>
        <button onClick={onServerTest}>hi</button>
      </div>
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
