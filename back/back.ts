import * as WebSocket from "ws";
import * as tar from "tar";
import * as fs from "fs";

const WebsocketServer = WebSocket.Server;

type MessageToServerType = {
  state: string;
  dockerForm?: string;
};

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

const test = (clientWS) => {
  tar
    .c(
      {
        file: "./test4.tar",
        C: "D:/project/publishingExtension/dockerfileMaker/nillworld",
      },
      ["./project"]
    )
    .then(() => {
      console.log("check done");
      fs.readFile("./test4.tar", (err, data) => {
        clientWS.send(data);
        console.log(data);
      });
    });
};

clientConnect();
