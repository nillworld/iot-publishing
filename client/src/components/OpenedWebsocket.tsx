import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../App.css";
import DockerFormInput from "./DockerFormInput";
import "./OpenedWebsocket.css";
import TransferMessage from "./TransferMessage";

type Props = {
  ws: WebSocket | undefined;
};
type MessageType = {
  state: string;
};

function OpenedWebsocket(props: Props) {
  const ws = props.ws;

  const [state, setState] = useState({});
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileSendCheck, setFileSendCheck] = useState<boolean>();
  const [downloadedPercent, setDownloadedPercent] = useState<string>("0%");
  const [lineId, setLineId] = useState<number>(0);
  const [lineOption, setLineOption] = useState<string[]>();
  const [lineValue, setLineValue] = useState<string[]>();
  const [inputComponents, setInputComponents] = useState<any>();

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
      1: { template: "Java" },
      2: { FROM: "3" },
      3: { WORKDIR: "" },
      4: { RUN: "" },
      5: { ENTRYPOINT: "" },
      6: { CMD: "" },
      7: { ENV: "" },
      8: { ARG: "" },
    },
  ];

  const setTemplateForm = (e: any) => {
    const jsonTemplate = JSON.parse(e.target.value);
    const jsonTemplateKeys: string[] = Object.keys(jsonTemplate);
    const jsonTemplateValues: string[] = Object.values(jsonTemplate);

    let jsonTemplateKeysToInt: number[] = [];
    jsonTemplateKeys.map((key) => {
      jsonTemplateKeysToInt.push(parseInt(key));
    });
    let templateKeys: any[] = [];
    let templateValues: any[] = [];
    jsonTemplateValues.map((templateLineData) => {
      templateKeys.push(Object.keys(templateLineData)[0]);
      templateValues.push(Object.values(templateLineData)[0]);
    });
    setInputComponents(jsonTemplateKeysToInt);
    setLineId(jsonTemplateKeysToInt.length);
    setLineOption(templateKeys);
    setLineValue(templateValues);
    if (templateValues) {
    }
  };

  const valueOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const onChangeFile = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const sendMessage = () => {
    setFileSendCheck(true);
    const reader = new FileReader();
    const fileName = selectedFile?.name;
    const fileSize = selectedFile?.size;
    const BUFFER_SIZE = 1024;
    let pos = 0;
    if (selectedFile) {
      reader.readAsArrayBuffer(selectedFile);
      console.log("selectedFile.name", selectedFile.name);

      if (ws) {
        ws.send(JSON.stringify(state));
        ws.onmessage = (message) => {
          let sendChecker = JSON.parse(message.data).sendChecker;
          setDownloadedPercent(JSON.parse(message.data).downloadedPercent);
          const fileInfo = { fileName: fileName, fileSize: fileSize };
          if (sendChecker === "FILE_INFO") {
            ws.send(JSON.stringify(fileInfo));
          } else if (sendChecker === "DATA") {
            while (pos != fileSize) {
              ws.send(selectedFile.slice(pos, pos + BUFFER_SIZE));
              pos = pos + BUFFER_SIZE;
              if (fileSize && pos > fileSize) {
                pos = fileSize;
              }
            }
            ws.send("DONE");

            //ws.close();
          } else if (sendChecker === "DOWNLOADING") {
            // console.log(downloadedPercent);
            // progressBar.style.width = downloadedPercent;
          }
        };
      }
    }
  };

  const appendInput = () => {
    if (inputComponents) {
      setInputComponents([...inputComponents, lineId]);
    } else {
      setInputComponents([lineId]);
    }
    setLineId(lineId + 1);
  };

  const clearValue = () => {
    setState({
      template: "",
      FROM: "",
      WORKDIR: "",
      RUN: "",
      ENTRYPOINT: "",
      CMD: "",
      ENV: "",
      ARG: "",
    });
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
              ? inputComponents.map((lineId: any, index: any) => (
                  <DockerFormInput
                    key={lineId}
                    lineId={lineId}
                    setLineId={setLineId}
                    setInputComponents={setInputComponents}
                    inputComponents={inputComponents}
                    option={lineOption ? lineOption[lineId] : ""}
                    value={lineValue ? lineValue[lineId] : ""}
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
            <button className="dockerform-btn" onClick={sendMessage} disabled={fileSendCheck}>
              메세지 보내기
            </button>
            <button onClick={clearValue}>초기화</button>
          </div>
        </div>
      </header>
    </div>
  );
}
export default OpenedWebsocket;
