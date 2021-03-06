import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./WebsocketConnecter.css";

type Props = {
  wsOpenCheck: boolean;
  backWebSocket: WebSocket | undefined;
  setMessageForBack: Dispatch<SetStateAction<Message | undefined>>;
  connectCheck: boolean;
  setConnectCheck: Dispatch<SetStateAction<boolean>>;
};

type Message = {
  state: string | undefined;
  generatorIP?: {} | undefined;
  dockerForm?: {} | undefined;
};

function WebsocketConnecter(props: Props) {
  const [ip, setIP] = useState<String>("");
  const [port, setPort] = useState<String>();
  const [webSocketState, setWebSocketState] = useState("");
  const [ipRegExpCheck, setIpRegExpCheck] = useState("IP를 입력하세요.");
  const [portRegExpCheck, setPortRegExpCheck] = useState("PORT를 입력하세요.");
  const [ipCheck, setIpCheck] = useState(true);
  const [portCheck, setPortCheck] = useState(true);

  const getIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const re =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    if (re.test(e.target.value) !== false || "localhost" === e.target.value) {
      setIpRegExpCheck("");
      setIP(e.target.value);
      setIpCheck(false);
    } else {
      setIpRegExpCheck("옳바른 IP 형식으로 입력하세요.");
      setIP("");
      setIpCheck(true);
    }
  };

  const getPort = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intValue = parseInt(e.target.value);
    if (intValue >= 0 && intValue <= 65535) {
      setPortRegExpCheck("");
      setPort(e.target.value);
      setPortCheck(false);
    } else {
      setPortRegExpCheck("옳바른 PORT 형식으로 입력하세요.");
      setPort("");
      setPortCheck(true);
    }
  };

  const enterKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(ipCheck || portCheck)) {
      connectGenerator();
    }
  };

  const connectGenerator = () => {
    if (ipCheck || portCheck) {
      console.log("잘못된 접근입니다.");
      return;
    }
    setWebSocketState("연결중..");
    setTimeout(() => {
      setWebSocketState("연결을 다시 확인해 주세요.");
      props.setConnectCheck(true);
    }, 3000);
    if (props.backWebSocket) {
      props.setMessageForBack({
        state: "GENERATOR_CONNECT",
        generatorIP: { ip: ip, port: port },
      });
      props.setConnectCheck(false);
    }
  };

  // 테스트용 Generator Connector
  const connectGeneratorTest = () => {
    console.log("connectGenerator");
    if (props.backWebSocket) {
      props.setMessageForBack({
        state: "GENERATOR_CONNECT",
        generatorIP: { ip: "localhost", port: 1234 },
      });
    }
  };

  return (
    <div className="form">
      <div className="form-box">
        <div className="input-div">
          서버IP:
          <input placeholder="ex) 192.168.0.5" name="test" onChange={getIP} onKeyPress={enterKeypress} />
        </div>
        <div className="input-div">
          PORT:
          <input placeholder="ex) 4500" type="number" name="test" onChange={getPort} onKeyPress={enterKeypress} />
        </div>

        <button onClick={connectGenerator} disabled={ipCheck || portCheck || !props.connectCheck}>
          back 통해서 generator 연결
        </button>
        <button onClick={connectGeneratorTest}>back 통해서 generator 연결 테스트</button>
        <div className="check-comment">{ipRegExpCheck}</div>
        <div className="check-comment">{portRegExpCheck}</div>
        <div className="check-comment">{webSocketState}</div>
      </div>
    </div>
  );
}
export default WebsocketConnecter;
