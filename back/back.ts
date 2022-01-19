import * as WebSocket from "ws";
import * as tar from "tar";
import * as fs from "fs";
import { StatsBase } from "fs";

const WebsocketServer = WebSocket.Server;

type MessageToServerType = {
  state: string;
  dockerForm?: string;
  fileName?: string;
  fileSize?: number;
};
type MessageToClientType = {
  state: string;
  value?: any;
};

let tarFile: StatsBase<number>;

const clientConnect = () => {
  const backWSS = new WebsocketServer({ port: 4000 });

  let generatorWS;
  let messageToServer: MessageToServerType = { state: "" };
  let messageToClient: MessageToClientType = { state: "" };

  console.log("ws 4000 열림");

  backWSS.on("connection", (clientWS) => {
    console.log("back이랑 연결 됨");
    clientWS.on("message", (message) => {
      const jsonMessage = JSON.parse(message.toString());
      console.log(jsonMessage);
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
          messageToClient.state = "GENERATOR_CONNECTED";
          console.log("GeneratorWS opened");
          clientWS.send(JSON.stringify(messageToClient));
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

      generatorWS.onmessage = (message) => {
        const messageFromGenerator = JSON.parse(message.data);
        console.log("#### Message from generator: ", messageFromGenerator);

        if (messageFromGenerator.state === "MADE_DOCKER_FILE") {
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
              sendFileInfo();
            });
        } else if (messageFromGenerator.state === "SET_FILE_INFO") {
          const BUFFER_SIZE = 1024;
          let pos = 0;
          fs.readFile(messageToServer.fileName, (err, data) => {
            while (pos != messageToServer.fileSize) {
              generatorWS.send(data.slice(pos, pos + BUFFER_SIZE));
              pos = pos + BUFFER_SIZE;
              if (messageToServer.fileSize && pos > messageToServer.fileSize) {
                pos = messageToServer.fileSize;
              }
            }
            generatorWS.send("DONE");
            messageToClient.state = "GENERATOR_DOWNLOAD_DONE";
            clientWS.send(JSON.stringify(messageToClient));
          });
        } else if (messageFromGenerator.state === "DOWNLOADING_FROM_BACK") {
          messageToClient.state = "DOWNLOADING_FROM_BACK";
          messageToClient.value = messageFromGenerator.downloadedPercent;
          clientWS.send(JSON.stringify(messageToClient));
        }

        const sendFileInfo = () => {
          console.log("?????");
          messageToServer.state = "SET_FILE_INFO";
          messageToServer.fileName = "project.tar";
          messageToServer.fileSize = tarFile?.size;
          console.log(messageToServer);
          generatorWS.send(JSON.stringify(messageToServer));
        };
      };
    });
  });

  const makeDockerfileText = (dockerFormData) => {
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
        txt = `${txt}\n${lineSelected[0]} ${lineInput[0]}`;
      } else {
        txt = `${lineSelected[0]} ${lineInput[0]}`;
      }
    });

    return txt;
  };

  // if (tarFile && dockerFormData) {
  //   setFileSendCheck(true);
  //   reader.readAsArrayBuffer(tarFile);
  //   console.log("tarFile.name", tarFile.name);

  //   if (backWebSocket) {
  //     backWebSocket.send(makeDockerfile());
  //     backWebSocket.onmessage = (message) => {
  //       let sendChecker = JSON.parse(message.data).sendChecker;
  //       setDownloadedPercent(JSON.parse(message.data).downloadedPercent);
  //       const fileInfo = { fileName: fileName, fileSize: fileSize };
  //       if (sendChecker === "FILE_INFO") {
  //         backWebSocket.send(JSON.stringify(fileInfo));
  //       } else if (sendChecker === "DATA") {
  //         while (pos != fileSize) {
  //           backWebSocket.send(tarFile.slice(pos, pos + BUFFER_SIZE));
  //           pos = pos + BUFFER_SIZE;
  //           if (fileSize && pos > fileSize) {
  //             pos = fileSize;
  //           }
  //         }
  //         backWebSocket.send("DONE");

  //         //backWebSocket.close();
  //       } else if (sendChecker === "DOWNLOADING") {
  //         console.log(downloadedPercent);
  //       } else if (sendChecker === "TAR") {
  //         console.log("TAR");
  //         backWebSocket.send("TAR");
  //       } else if (sendChecker === "BUILD") {
  //         console.log("BUILD");
  //         backWebSocket.send("BUILD");
  //       }
  //     };
  //   }
  // }
};

clientConnect();
