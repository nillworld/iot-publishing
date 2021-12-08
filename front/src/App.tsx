import React, { useEffect, useState } from "react";
import DockerForm from "./DockerForm";
import WebsocketConnecter from "./WebsocketConnecter";
function App() {
  const [ip, setIP] = useState("");
  const [port, setPort] = useState("");
  const [wsOpenCheck, setWsOpenCheck] = useState(false);

  return (
    <div>
      {wsOpenCheck ? (
        <DockerForm ip={ip} port={port} />
      ) : (
        <WebsocketConnecter
          setIP={setIP}
          ip={ip}
          setPort={setPort}
          port={port}
          setWsOpenCheck={setWsOpenCheck}
        />
      )}
      IP: {ip}:{port}
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
