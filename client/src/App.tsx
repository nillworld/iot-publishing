import React, { useEffect, useState } from "react";
import OpenedWebsocket from "./components/OpenedWebsocket";
import WebsocketConnecter from "./components/WebsocketConnecter";
import TransferMessage from "./components/TransferMessage";

type Message = {
  state: string | undefined;
  generatorIP?: {} | undefined;
  dockerForm?: {} | undefined;
  architecture?: string | undefined;
  dockerName?: string | undefined;
  dockerTag?: string | undefined;
  downloadedPercent?: string | undefined;
};

function App() {
  const [wsOpenCheck, setWsOpenCheck] = useState<boolean>(false);
  const [backWebSocket, setBackWebsocket] = useState<WebSocket>();
  const [messageForBack, setMessageForBack] = useState<Message>();
  const [downloadedPercent, setDownloadedPercent] = useState<string | undefined>();
  const [connectCheck, setConnectCheck] = useState(true);
  const [preGeneratorState, setPreGeneratorState] = useState<string>("");
  const [generatorState, setGeneratorState] = useState<string>("");

  const connectBack = () => {
    setBackWebsocket(new WebSocket(`ws://localhost:4000/ws`));
  };
  useEffect(() => {
    if (backWebSocket) {
      backWebSocket.onopen = () => {
        console.log("Websocket port 4000으로 back과 통신 중");

        backWebSocket.onmessage = (message) => {
          const jsonMessage = JSON.parse(message.data);
          // console.log("Message from back", jsonMessage);
          if (jsonMessage.state === "GENERATOR_CONNECTED") {
            setWsOpenCheck(true);
          } else if (jsonMessage.state === "GENERATOR_CONNECT_ERROR") {
          } else if (jsonMessage.state === "DOWNLOADING_FROM_BACK") {
            setGeneratorState("프로젝트 파일을 업로드 중입니다.");
            setDownloadedPercent(jsonMessage.value);
          } else if (jsonMessage.state === "GENERATOR_DOWNLOAD_DONE") {
            setDownloadedPercent("none");
            setPreGeneratorState("프로젝트 파일 업로드 완료.");
            setGeneratorState("서버에서 tar 압축 해제 중...");
          } else if (jsonMessage.state === "GENERATOR_TAR_DECOMPRESS_DONE") {
            setPreGeneratorState("서버에서 tar 압축 해제 완료.");
            setGeneratorState("서버에서 도커 빌드 중...");
          } else if (jsonMessage.state === "GENERATOR_DOCKER_BUILD_DONE") {
            setPreGeneratorState("서버에서 도커 빌드 완료.");
            setGeneratorState("서버에서 도커 이미지 tar로 압축 중...");
          } else if (jsonMessage.state === "GENERATOR_DOCKER_SAVE_DONE") {
            setPreGeneratorState("서버에서 도커 이미지 tar로 압축 완료.");
            setGeneratorState("서버에서 tar 파일 보내는 중...");
          } else if (jsonMessage.state === "SENDING_TAR_FROM_GENERATOR") {
            console.log(jsonMessage.value);
            setDownloadedPercent(jsonMessage.value);
            setPreGeneratorState("서버에서 도커 이미지 tar로 압축 완료.");
            setGeneratorState("서버에서 tar 파일(도커 이미지) 보내는 중...");
          } else if (jsonMessage.state === "DOWNLOAD_DONE_FROM_GENERATOR") {
            setPreGeneratorState("");
            setGeneratorState("Docker 이미지 파일(tar) 다운로드 완료.");
          }
        };
      };
      backWebSocket.onclose = () => {
        console.log("Websocket port 4000 닫힘");
      };
    }
  }, [backWebSocket]);

  //back으로 'messageForBack'내용 바뀔때 마다 보냄
  useEffect(() => {
    backWebSocket?.send(JSON.stringify(messageForBack));
    console.log("MessageForBack", messageForBack);
  }, [messageForBack]);

  return (
    <div>
      {backWebSocket ? "" : <button onClick={connectBack}>이 버튼이 vscode api 연결 임시 방편</button>}
      {wsOpenCheck ? (
        <OpenedWebsocket
          backWebSocket={backWebSocket}
          setMessageForBack={setMessageForBack}
          downloadedPercent={downloadedPercent}
          preGeneratorState={preGeneratorState}
          generatorState={generatorState}
        />
      ) : (
        <WebsocketConnecter
          wsOpenCheck={wsOpenCheck}
          backWebSocket={backWebSocket}
          setMessageForBack={setMessageForBack}
          connectCheck={connectCheck}
          setConnectCheck={setConnectCheck}
        />
      )}
      <div></div>
    </div>
  );
}
console.log(WebsocketConnecter.prototype.ipCheck);
export default App;
