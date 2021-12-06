import React, { useState } from 'react';
import WebsocketConnecter from './WebsocketConnecter';
function App() {
  const [ip, setIP] = useState('');
  const [port, setPort] = useState('');
  return (
    <div>
      <WebsocketConnecter setIP={setIP} setPort={setPort} />
      IP: {ip}:{port}
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
