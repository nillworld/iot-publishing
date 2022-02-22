// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ViewLoader from "./view/ViewLoader";

import * as WebSocket from "ws";
import * as tar from "tar";
import * as fs from "fs";

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

let tarFile: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-react" is now active!');

  const backWSS = new WebsocketServer({ port: 4000 });

  let generatorWS: any;
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

      generatorWS.onmessage = (generatorMessage: any) => {
        let messageType = typeof generatorMessage.data;
        if (messageType === "string") {
          const messageFromGenerator = JSON.parse(generatorMessage.data);
          if (messageFromGenerator.state === "MADE_DOCKER_FILE") {
            tar
              .c(
                {
                  file: "./project.tar",
                  // C: "D:/project/publishingExtension/dockerfileMaker/nillworld",
                  C: __dirname,
                },
                ["./project"]
              )
              .then(() => {
                tarFile = fs.statSync("./project.tar");
                messageToServer.state = "SET_FILE_INFO";
                messageToServer.fileName = "project.tar";
                messageToServer.fileSize = tarFile.size;
                generatorWS.send(JSON.stringify(messageToServer));
              });
          } else if (messageFromGenerator.state === "SET_FILE_INFO") {
            senderToServer("SET_DOCKER_NAME", jsonMessage.dockerName);
          } else if (messageFromGenerator.state === "SET_DOCKER_NAME") {
            senderToServer("SET_DOCKER_TAG", jsonMessage.dockerTag);
          } else if (messageFromGenerator.state === "SET_DOCKER_TAG") {
            const streamProjectFile = fs.createReadStream("./project.tar", {
              highWaterMark: 1048576 * 16,
            });
            streamProjectFile.on("data", (fileData) => {
              generatorWS.send(fileData);
            });
            streamProjectFile.on("end", () => {
              senderToClient("GENERATOR_DOWNLOAD_DONE");
              senderToServer("GENERATOR_TAR_DECOMPRESS", "");
              fs.unlinkSync("./project.tar");
            });
          } else if (messageFromGenerator.state === "DOWNLOADING_FROM_BACK") {
            senderToClient("DOWNLOADING_FROM_BACK", messageFromGenerator.value);
          } else if (messageFromGenerator.state === "GENERATOR_DOWNLOAD_DONE") {
          } else if (messageFromGenerator.state === "GENERATOR_TAR_DECOMPRESS_DONE") {
            senderToClient("GENERATOR_TAR_DECOMPRESS_DONE");
            senderToServer("GENERATOR_DOCKER_BUILD", jsonMessage.architecture);
          } else if (messageFromGenerator.state === "GENERATOR_DOCKER_BUILD_DONE") {
            senderToClient("GENERATOR_DOCKER_BUILD_DONE");
            senderToServer("GENERATOR_DOCKER_SAVE");
          } else if (messageFromGenerator.state === "GENERATOR_DOCKER_SAVE_DONE") {
            senderToClient("GENERATOR_DOCKER_SAVE_DONE");
            senderToServer("SEND_FILE_SIZE_FROM_GENERATOR");
          } else if (messageFromGenerator.state === "GENERATOR_DOCKER_SIZE") {
            dockerizedSize = messageFromGenerator.value;
            senderToServer("SEND_TAR_FROM_GENERATOR");
          } else if (messageFromGenerator.state === "DONE_SENDING_TAR_FROM_GENERATOR") {
            senderToClient("DOWNLOAD_DONE_FROM_GENERATOR");
          }
        } else {
          //File download - stream(object)
          fs.appendFileSync(`${__dirname}\\dockerized.tar`, generatorMessage.data);
          downloadedFileSize += generatorMessage.data.length;
          if (dockerizedSize) {
            downloadedPercent = `${Math.round((downloadedFileSize / dockerizedSize) * 100)}%`;
            senderToClient("SENDING_TAR_FROM_GENERATOR", downloadedPercent);
          }
        }
      };
    });
  });

  const makeDockerfileText = (dockerFormData: any) => {
    let lineValues = Object.values(dockerFormData);
    let txt = "";
    lineValues.map((lineValue: any, index) => {
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

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.viewconfig", () => {
    let openDialogOptions: vscode.OpenDialogOptions = {
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        Json: ["json"],
      },
    };

    vscode.window.showOpenDialog(openDialogOptions).then(async (uri: vscode.Uri[] | undefined) => {
      if (uri && uri.length > 0) {
        const view = new ViewLoader(uri[0], context.extensionPath);
      } else {
        vscode.window.showErrorMessage("No valid file selected!");
        return;
      }
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
