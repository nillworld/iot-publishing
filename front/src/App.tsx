import React, { useEffect, useState } from "react";
import WebsocketConnecter from "./WebsocketConnecter";
function App() {
  const [ip, setIP] = useState("");
  const [port, setPort] = useState("");
  const [wsOpenCheck, setWsOpenCheck] = useState(false);

  return (
    <div>
      {wsOpenCheck ? <div>ok</div> : <WebsocketConnecter setIP={setIP} setPort={setPort} setWsOpenCheck={setWsOpenCheck} />}
      IP: {ip}:{port}
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
