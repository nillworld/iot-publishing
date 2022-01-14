import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../App.css";
import DockerFormInput from "./DockerFormInput";
import "./OpenedWebsocket.css";
import TransferMessage from "./TransferMessage";

type Props = {
  backWebSocket: WebSocket | undefined;
  setMessageForBack: Dispatch<SetStateAction<Message | undefined>>;
};

type Message = {
  state: string | undefined;
  generatorIP?: {} | undefined;
  dockerFormData?: {} | undefined;
};

function OpenedWebsocket(props: Props) {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileSendCheck, setFileSendCheck] = useState<boolean>();
  const [downloadedPercent, setDownloadedPercent] = useState<string>("0%");
  const [lineId, setLineId] = useState<number>(0);
  const [lineOption, setLineOption] = useState<string[]>();
  const [lineValue, setLineValue] = useState<string[]>();
  const [inputComponents, setInputComponents] = useState<number[]>();
  const [dockerFormData, setDockerFormData] = useState<any>();

  const templateForms = [
    {
      0: { template: "-Template-" },
    },
    {
      0: { template: "Node 16" },
      1: { FROM: "node:16-alpine3.11" },
      2: { WORKDIR: "/app" },
      3: { COPY: "package*.json /app" },
      4: { RUN: "npm install" },
      5: { COPY: ". /app" },
      6: { ENTRYPOINT: "" },
      7: { CMD: '[ "node", "server.js" ]' },
      8: { ENV: "" },
      9: { ARG: "" },
    },
    {
      0: { template: "Node 14" },
      1: { FROM: "1" },
    },
    {
      0: { template: "Python" },
      1: { FROM: "2" },
      2: { WORKDIR: "" },
      3: { RUN: "" },
      4: { ENTRYPOINT: "" },
      5: { CMD: "" },
      6: { ENV: "" },
      7: { ARG: "" },
    },
    {
      0: { template: "Java" },
      1: { FROM: "3" },
      2: { WORKDIR: "" },
      3: { RUN: "" },
      4: { ENTRYPOINT: "" },
      5: { CMD: "" },
      6: { ENV: "" },
      7: { ARG: "" },
    },
  ];

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_FORM", dockerFormData: dockerFormData });
  }, [dockerFormData]);

  const setTemplateForm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    const jsonTemplate = JSON.parse(e.target.value);
    const jsonTemplateKeys: string[] = Object.keys(jsonTemplate);
    const jsonTemplateValues: string[] = Object.values(jsonTemplate);

    let jsonTemplateKeysToInt: number[] = [];
    jsonTemplateKeys.map((key) => {
      jsonTemplateKeysToInt.push(parseInt(key));
    });
    let templateKeys: Array<string> = [];
    let templateValues: Array<string> = [];
    jsonTemplateValues.map((templateLineData) => {
      templateKeys.push(Object.keys(templateLineData)[0]);
      templateValues.push(Object.values(templateLineData)[0]);
    });
    setDockerFormData(jsonTemplate);
    setInputComponents(jsonTemplateKeysToInt);
    setLineId(jsonTemplateKeysToInt.length);
    setLineOption(templateKeys);
    setLineValue(templateValues);
    if (templateValues) {
    }
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.files[0]);
      setSelectedFile(e.target.files[0]);
    }
  };

  const dockerBuild = () => {
    ///////////////////////
    props.setMessageForBack({ state: "SET_DOCKER_FORM", dockerFormData: dockerFormData });

    ///////////////////////////

    /* 웹소켓에서 버퍼로 잘라 파일 보내기
    const reader = new FileReader();
    const fileName = selectedFile?.name;
    const fileSize = selectedFile?.size;
    const BUFFER_SIZE = 1024;
    let pos = 0;
    if (selectedFile && dockerFormData) {
      setFileSendCheck(true);
      reader.readAsArrayBuffer(selectedFile);
      console.log("selectedFile.name", selectedFile.name);

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
              backWebSocket.send(selectedFile.slice(pos, pos + BUFFER_SIZE));
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
    } */
  };

  const makeDockerfileText = () => {
    console.log(dockerFormData);
    // dockerFormData.map((lineData: any) => {
    //   console.log(lineData);
    // });
    let lineValues = Object.values(dockerFormData);
    let txt = "";
    lineValues.map((lineValue: any, index) => {
      let lineSelected = Object.keys(lineValue);
      let lineInput = Object.values(lineValue);
      if (index === 0) {
        return;
      }
      if (lineSelected[0] === "" || lineInput[0] === "") {
        return;
      }
      txt = `${txt}\n ${lineSelected[0]} ${lineInput[0]}`;
    });
    return txt;
  };

  const appendInput = () => {
    if (inputComponents) {
      setInputComponents([...inputComponents, lineId === 0 ? lineId + 1 : lineId]);
    } else {
      setInputComponents([lineId === 0 ? lineId + 1 : lineId]);
    }
    setDockerFormData({ ...dockerFormData, [lineId === 0 ? lineId + 1 : lineId]: "" });
    setLineId(lineId === 0 ? lineId + 2 : lineId + 1);
  };

  const clearValue = () => {
    setInputComponents([]);
  };

  return fileSendCheck ? (
    <TransferMessage downloadedPercent={downloadedPercent} />
  ) : (
    <div className="App">
      <header className="App-header">
        <div className="form-div">
          <select onChange={setTemplateForm}>
            {templateForms.map((templateForm, index) => (
              <option value={JSON.stringify(templateForm)} key={index}>
                {templateForm[0]?.template}
              </option>
            ))}
          </select>
          <div>
            {inputComponents
              ? inputComponents.map((lineId: number) => (
                  <DockerFormInput
                    key={lineId}
                    lineId={lineId}
                    setLineId={setLineId}
                    setInputComponents={setInputComponents}
                    inputComponents={inputComponents}
                    option={lineOption ? lineOption[lineId] : ""}
                    value={lineValue ? lineValue[lineId] : ""}
                    dockerFormData={dockerFormData}
                    setDockerFormData={setDockerFormData}
                  />
                ))
              : ""}
            <button onClick={appendInput}>ADD Instruction</button>
          </div>
          <div className="filebtn-div">
            <label className="filebtn">
              프로젝트 선택
              <input placeholder="arg 입력~" type="file" name={"file"} onChange={onChangeFile} />
            </label>
            <div className="fileName-div">{selectedFile ? selectedFile.name : ".tar파일 선택"}</div>
          </div>

          <div>
            <button className="dockerform-btn" onClick={dockerBuild} disabled={fileSendCheck}>
              도커로 빌드하기
            </button>
            <button onClick={clearValue}>초기화</button>
          </div>
          <div>{JSON.stringify(dockerFormData)}</div>
        </div>
      </header>
    </div>
  );
}
export default OpenedWebsocket;
