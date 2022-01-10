import React, { useEffect, useState } from "react";
import OpenedWebsocket from "./components/OpenedWebsocket";
import WebsocketConnecter from "./components/WebsocketConnecter";
import TransferMessage from "./components/TransferMessage";
function App() {
  const [wsOpenCheck, setWsOpenCheck] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket>();
  const [backWebSocket, setBackWebsocket] = useState<WebSocket>();

  // express로 back이랑 연결 방식
  // const onServerTest = () => {
  //   fetch("http://localhost:3001/")
  //     .then((res) => res.json())
  //     .then((data) => console.log(data));
  // };
  const connectBack = () => {
    setBackWebsocket(new WebSocket(`ws://localhost:4000/ws`));
  };
  useEffect(() => {
    // onServerTest();
    if (backWebSocket) {
      backWebSocket.onopen = () => {
        console.log("Websocket port 4000으로 back과 통신 중");
        backWebSocket.send("tar");

        backWebSocket.onmessage = (message) => {
          console.log(message.data);
        };
      };
      backWebSocket.onclose = () => {
        console.log("Websocket port 4000 닫힘");
      };
    }
  }, [backWebSocket]);

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
      <button onClick={connectBack}>이 버튼이 vscode api 연결 임시 방편</button>
      {wsOpenCheck ? (
        <OpenedWebsocket ws={ws} />
      ) : (
        <WebsocketConnecter wsOpenCheck={wsOpenCheck} ws={ws} setWs={setWs} />
      )}
      <div></div>
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
