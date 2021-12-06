import React, { useState } from 'react';
function WebsocketConnecter(props: any) {
  const [webSocketState, setWebSocketState] = useState('');
  const [ipRegExpCheck, setIpRegExpCheck] = useState('IP를 입력하세요.');
  const [portRegExpCheck, setPortRegExpCheck] = useState('PORT를 입력하세요');
  const [ipCheck, setIpCheck] = useState(true);
  const [portCheck, setPortCheck] = useState(true);

  const getIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const re =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    if (re.test(e.target.value) !== false) {
      setIpRegExpCheck('');
      props.setIP(e.target.value);
      setIpCheck(false);
    } else {
      setIpRegExpCheck('IP 형식 제대로 입력하세요.');
      props.setIP('');
      setIpCheck(true);
    }
  };

  const getPort = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intValue = parseInt(e.target.value);
    if (intValue >= 0 && intValue <= 65535) {
      setPortRegExpCheck('');
      props.setPort(e.target.value);
      setPortCheck(false);
    } else {
      setPortRegExpCheck('PORT 형식 제대로 입력하세요.');
      props.setPort('');
      setPortCheck(true);
    }
  };

  const connectServer = () => {
    if (ipCheck || portCheck) {
      console.log('잘못된 접근입니다.');
      return;
    }
    setWebSocketState('연결중..');
    const ws = new WebSocket('ws://172.10.12.95:2/ws');

    console.log('계속 열려 있는 건가?');
    ws.onclose = () => {
      console.log('닫혀 버렸다 이기야~');
      setWebSocketState('닫힘!');
    };
    ws.onopen = () => {
      console.log('열려 버렸다 이기야~');
      setWebSocketState('열림!');
    };
    // ws.onmessage = (evt: MessageEvent) => {
    //   console.log(evt);
    //   console.log(evt.data);w
    // };
  };
  return (
    <div>
      <div>
        서버IP:
        <input placeholder="ex) 192.168.0.5" name="test" onChange={getIP} />
      </div>
      <div>
        PORT:
        <input placeholder="ex) 4500" type="number" name="test" onChange={getPort} />
      </div>
      <button onClick={connectServer} disabled={ipCheck || portCheck}>
        연결
      </button>
      <div>{ipRegExpCheck}</div>
      <div>{portRegExpCheck}</div>
      <div>{webSocketState}</div>
    </div>
  );
}
export default WebsocketConnecter;
