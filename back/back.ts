import * as WebSocket from "ws";
import * as tar from "tar";
import * as fs from "fs";
import { StatsBase } from "fs";

const WebsocketServer = WebSocket.Server;

type MessageToServerType = {
  state: string;
  dockerForm?: string;
};

let tarFile: StatsBase<number>;

const clientConnect = () => {
  const backWSS = new WebsocketServer({ port: 4000 });

  let generatorWS;
  let messageToServer: MessageToServerType = { state: "" };

  console.log("ws 4000 열림");

  backWSS.on("connection", (clientWS) => {
    console.log("back이랑 연결 됨");
    clientWS.on("message", (message) => {
      const jsonMessage = JSON.parse(message.toString());
      console.log(jsonMessage);
      if (message.toString() === "tar") {
        test(clientWS);
      }
      if (jsonMessage.state === "GENERATOR_CONNECT") {
        const ip = jsonMessage.generatorIP.ip;
        const port = jsonMessage.generatorIP.port;

        let generatorWSOpenCheck = false;

        generatorWS = new WebSocket(`ws://${ip}:${port}/ws`);
        setTimeout(() => {
          if (!generatorWSOpenCheck) {
            generatorWS.close();
            console.log("3초 후 닫힘");
          }
        }, 3000);
        generatorWS.onerror = () => {
          if (!generatorWSOpenCheck) {
            console.log("Generator 연결에러");
            generatorWS.close();
          }
        };
        generatorWS.onopen = () => {
          let projectDir = __dirname + "/../project";
          console.log(projectDir);
          fs.readdir(projectDir, (err, data) => {
            console.log(data);
          });
          messageToServer.state = "GENERATOR_START";
          console.log("GeneratorWS opened");
          clientWS.send("GENERATOR_CONNECTED");
          generatorWS.send(JSON.stringify(messageToServer));

          generatorWSOpenCheck = true;
        };

        // generatorWS.onmessage = (message) => {
        //   console.log("#### Message from generator: ", message.data);
        // };
      }
      if (jsonMessage.state === "SET_DOCKER_FORM") {
        messageToServer.state = "MAKE_DOCKER_FILE";
        const dockerFileText = makeDockerfileText(jsonMessage.dockerFormData);
        messageToServer.dockerForm = dockerFileText;
        generatorWS.send(JSON.stringify(messageToServer));
      }
    });
  });
};

const makeDockerfileText = (dockerFormData) => {
  console.log(dockerFormData);
  // dockerFormData.map((lineData: any) => {
  //   console.log(lineData);
  // });
  let lineValues = Object.values(dockerFormData);
  let txt = "";
  lineValues.map((lineValue, index) => {
    let lineSelected = Object.keys(lineValue);
    let lineInput = Object.values(lineValue);

    if (index === 0) {
      return;
    }
    if (lineValue === "" || lineSelected[0] === "" || lineInput[0] === "") {
      return;
    }
    if (txt) {
      txt = `${txt}\n ${lineSelected[0]} ${lineInput[0]}`;
    } else {
      txt = `${lineSelected[0]} ${lineInput[0]}`;
      console.log("????", txt);
    }
  });

  return txt;
};

const transToTar = (clientWS) => {
  tar
    .c(
      {
        file: "./project.tar",
        // C: "D:/project/publishingExtension/dockerfileMaker/nillworld",
        C: "../",
      },
      ["./project"]
    )
    .then(() => {
      console.log("check done");
      tarFile = fs.statSync("./project.tar");
      fs.readFile("./project.tar", (err, data) => {
        clientWS.send(data);
        console.log(data);
      });
    });
};

const sendFile = () => {
  //웹소켓에서 버퍼로 잘라 파일 보내기
  const reader = new FileReader();
  const fileName = "project.tar";
  const fileSize = tarFile?.size;
  const BUFFER_SIZE = 1024;
  let pos = 0;
  if (tarFile && dockerFormData) {
    setFileSendCheck(true);
    reader.readAsArrayBuffer(tarFile);
    console.log("tarFile.name", tarFile.name);

    if (backWebSocket) {
      backWebSocket.send(makeDockerfile());
      backWebSocket.onmessage = (message) => {
        let sendChecker = JSON.parse(message.data).sendChecker;
        setDownloadedPercent(JSON.parse(message.data).downloadedPercent);
        const fileInfo = { fileName: fileName, fileSize: fileSize };
        if (sendChecker === "FILE_INFO") {
          backWebSocket.send(JSON.stringify(fileInfo));
        } else if (sendChecker === "DATA") {
          while (pos != fileSize) {
            backWebSocket.send(tarFile.slice(pos, pos + BUFFER_SIZE));
            pos = pos + BUFFER_SIZE;
            if (fileSize && pos > fileSize) {
              pos = fileSize;
            }
          }
          backWebSocket.send("DONE");

          //backWebSocket.close();
        } else if (sendChecker === "DOWNLOADING") {
          console.log(downloadedPercent);
        } else if (sendChecker === "TAR") {
          console.log("TAR");
          backWebSocket.send("TAR");
        } else if (sendChecker === "BUILD") {
          console.log("BUILD");
          backWebSocket.send("BUILD");
        }
      };
    }
  }
};

clientConnect();
