import { WSA_E_CANCELLED } from 'constants';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [ip, setIP] = useState('');
  // const [ws, setWs] = useState<WebSocket>(new WebSocket(''));
  const [webSocketState, setWebSocketState] = useState('');
  const [ipRegExpCheck, setIpRegExpCheck] = useState('');
  const [ipCheck, setIpCheck] = useState(true);
  const getIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    let re =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    if (re.test(e.target.value) === false) {
      setIpRegExpCheck('Ip 형식 제대로 쓰세요.');
    } else {
      setIpRegExpCheck('');
      setIP(e.target.value);
      setIpCheck(false);
    }
  };

  const connectServer = () => {
    setWebSocketState('연결중..');
    console.log(ip);
    try {
      const ws = new WebSocket('ws://172.10.12.95:22224/ws');
      console.log(ws.readyState);
      console.log('계속 열려 있는 건가?');
      ws.onclose = () => {
        console.log('닫혀 버렸다 이기야~');
        setWebSocketState('닫힘!');
      };
      ws.onopen = () => {
        console.log('열려 버렸다 이기야~');
        setWebSocketState('열림!');
      };
    } catch (error) {
      setWebSocketState('올바르지 않은 IP');
      console.log(error);
      return;
    }
    // ws.onmessage = (evt: MessageEvent) => {
    //   console.log(evt);
    //   console.log(evt.data);w
    // };

    // const ws = new WebSocket('ws://172.10.12.95:1234/ws');
  };

  return (
    <div>
      <input placeholder="서버 ip 입력" name="test" onChange={getIP} />
      <button onClick={connectServer} disabled={ipCheck}>
        연결
      </button>
      <div>{ipRegExpCheck}</div>
      <div>{webSocketState}</div>
    </div>
  );
}
export default App;
