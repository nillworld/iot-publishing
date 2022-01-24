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
  value?: any;
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
      }
      if (jsonMessage.state === "SET_DOCKER_FORM") {
        messageToServer.state = "MAKE_DOCKER_FILE";
        const dockerFileText = makeDockerfileText(jsonMessage.dockerFormData);
        messageToServer.dockerForm = dockerFileText;
        generatorWS.send(JSON.stringify(messageToServer));
      }

      generatorWS.onmessage = (message) => {
        const messageFromGenerator = JSON.parse(message.data);
        // console.log("#### Message from generator: ", messageFromGenerator);

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
              messageToServer.state = "SET_FILE_NAME";
              messageToServer.fileName = "project.tar";
              generatorWS.send(JSON.stringify(messageToServer));
            });
        } else if (messageFromGenerator.state === "SET_FILE_NAME") {
          const BUFFER_SIZE = 1024;
          let pos = 0;
          messageToServer.state = "UPLOADING_FROM_BACK";
          fs.readFile(messageToServer.fileName, (err, data) => {
            console.log("check===1111", data);
            console.log("check===2222", data.toString());
            console.log("check===3333", data.toString("base64"));
            console.log("check===4444", Buffer.from(data.toString("base64"), "base64").toString("utf8"));

            let tarFileBase64 = data.toString("base64");
            messageToServer.fileSize = tarFileBase64.length;

            while (pos != tarFileBase64.length) {
              ///// 디코딩이 문제있는건지 파일이 제대로 전달 안됨
              /// encording to base64
              // let tarFileBase64 = data.toString('base64');
              // data size => tarFileBase64.length

              messageToServer.value = tarFileBase64.slice(pos, pos + BUFFER_SIZE);
              generatorWS.send(JSON.stringify(messageToServer));
              // generatorWS.send(data.slice(pos, pos + BUFFER_SIZE));
              pos = pos + BUFFER_SIZE;
              if (tarFileBase64.length && pos > tarFileBase64.length) {
                pos = tarFileBase64.length;
              }
            }
            // generatorWS.send("DONE");
            messageToClient.state = "GENERATOR_DOWNLOAD_DONE";
            clientWS.send(JSON.stringify(messageToClient));
          });
        } else if (messageFromGenerator.state === "DOWNLOADING_FROM_BACK") {
          messageToClient.state = "DOWNLOADING_FROM_BACK";
          messageToClient.value = messageFromGenerator.downloadedPercent;
          clientWS.send(JSON.stringify(messageToClient));
        }
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
