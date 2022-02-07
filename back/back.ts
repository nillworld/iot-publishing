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

  let dockerizedSize: number;
  let downloadedPercent: string;

  console.log("ws 4000 열림");

  backWSS.on("connection", (clientWS) => {
    console.log("back이랑 연결 됨");
    let downloadedFileSize = 0;

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

      const senderToClient = (state: string, value?: any) => {
        messageToClient.state = state;
        messageToClient.value = value;
        clientWS.send(JSON.stringify(messageToClient));
      };

      const senderToServer = (state: string, value?: any) => {
        messageToServer.state = state;
        messageToServer.value = value;
        generatorWS.send(JSON.stringify(messageToServer));
      };

      generatorWS.onmessage = (message) => {
        const messageFromGenerator = JSON.parse(message.data);
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
          const BUFFER_SIZE_MEGA = 1048576;
          let pos = 0;
          messageToServer.state = "UPLOADING_FROM_BACK";
          fs.readFile(messageToServer.fileName, (err, data) => {
            const dataBase64 = data.toString("base64");
            messageToServer.fileSize = dataBase64.length;
            while (pos != messageToServer.fileSize) {
              messageToServer.value = dataBase64.slice(pos, pos + BUFFER_SIZE_MEGA);
              generatorWS.send(JSON.stringify(messageToServer));
              console.log(messageToServer.value.length);
              pos = pos + BUFFER_SIZE_MEGA;
              if (messageToServer.fileSize && pos > messageToServer.fileSize) {
                pos = messageToServer.fileSize;
              }
            }
            try {
              fs.unlinkSync("./project.tar");
            } catch (error) {
              console.log("Error:", error);
            }
          });
        } else if (messageFromGenerator.state === "DOWNLOADING_FROM_BACK") {
          senderToClient("DOWNLOADING_FROM_BACK", messageFromGenerator.value);
        } else if (messageFromGenerator.state === "GENERATOR_DOWNLOAD_DONE") {
          senderToClient("GENERATOR_DOWNLOAD_DONE");
          senderToServer("GENERATOR_TAR_DECOMPRESS", "");
        } else if (messageFromGenerator.state === "GENERATOR_TAR_DECOMPRESS_DONE") {
          senderToClient("GENERATOR_TAR_DECOMPRESS_DONE");
          senderToServer("GENERATOR_DOCKER_BUILD");
        } else if (messageFromGenerator.state === "GENERATOR_DOCKER_BUILD_DONE") {
          senderToClient("GENERATOR_DOCKER_BUILD_DONE");
          senderToServer("GENERATOR_DOCKER_SAVE");
        } else if (messageFromGenerator.state === "GENERATOR_DOCKER_SAVE_DONE") {
          senderToClient("GENERATOR_DOCKER_SAVE_DONE");
          senderToServer("SEND_TAR_FROM_GENERATOR");
        } else if (messageFromGenerator.state === "GENERATOR_DOCKER_SIZE") {
          dockerizedSize = messageFromGenerator.value;
        } else if (messageFromGenerator.state === "SENDING_TAR_FROM_GENERATOR") {
          downloadedFileSize += messageFromGenerator.value.length;
          fs.appendFileSync(`./dockerized.tar`, Buffer.from(messageFromGenerator.value, "base64"));
          if (dockerizedSize) {
            downloadedPercent = `${Math.round((downloadedFileSize / dockerizedSize) * 100)}%`;
            senderToClient("SENDING_TAR_FROM_GENERATOR", downloadedPercent);
            if (downloadedFileSize === dockerizedSize) {
              senderToServer("DOWNLOAD_DONE_FROM_GENERATOR");
              senderToClient("DOWNLOAD_DONE_FROM_GENERATOR");
            }
          }
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
};

clientConnect();
