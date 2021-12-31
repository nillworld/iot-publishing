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

  const [state, setState] = useState({
    template: "",
    from: "",
    workdir: "",
    run: "",
    entrypoint: "",
    cmd: "",
    env: "",
    arg: "",
  });
  const [newObject, setNewObject] = useState<any>({});
  const templateForms = [
    {
      template: "-Template-",
      from: "",
      workdir: "",
      run: "",
      entrypoint: "",
      cmd: "",
      env: "",
      arg: "",
    },
    {
      template: "Node 16",
      from: "node:16-alpine3.11",
      workdir: "/app",
      run: "npm install",
      entrypoint: "",
      cmd: '[ "node", "server.js" ]',
      env: "",
      arg: "",
    },
    {
      template: "Node 14",
      from: "1",
      workdir: "",
      run: "",
      entrypoint: "",
      cmd: "",
      env: "",
      arg: "",
    },
    {
      template: "Python",
      from: "2",
      workdir: "",
      run: "",
      entrypoint: "",
      cmd: "",
      env: "",
      arg: "",
    },
    {
      template: "Jave",
      from: "3",
      workdir: "",
      run: "",
      entrypoint: "",
      cmd: "",
      env: "",
      arg: "",
    },
  ];
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileSendCheck, setFileSendCheck] = useState<boolean>();
  const [downloadedPercent, setDownloadedPercent] = useState<string>("0%");
  const [inputIndex, setInputIndex] = useState<number>(0);
  const [inputComponents, setInputComponents] = useState<any>();
  const [jsonTestKeys, setJsonTestKeys] = useState<Array<string>>();

  const setTemplateForm = (e: any) => {
    const jsonTemplate = JSON.parse(e.target.value);
    const jsonTemplateKeys = Object.keys(jsonTemplate);
    const jsonTemplateValues = Object.values(jsonTemplate);
    setJsonTestKeys(jsonTemplateKeys);
    let lengthArray = [];
    for (let i = 0; i < jsonTemplateKeys.length; i++) {
      lengthArray.push(i);
      newObject[i] = [jsonTemplateKeys[i], jsonTemplateValues[i]];
    }
    console.log(Object.keys(newObject));
    jsonTemplateKeys.map((index: any) => {
      console.log(index);
    });
    setInputComponents(lengthArray);
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
      console.log(selectedFile.name);

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
              //progressBarWidth = pos/fileSize*100;
              //console.log(progressBar.style.width);
              // widow.setInterval(setWidth, 500)
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

  // let inputComponents: number[] = [];
  const appendInput = () => {
    if (inputComponents) {
      setInputComponents([...inputComponents, inputIndex]);
    } else {
      setInputComponents([inputIndex]);
    }
    setInputIndex(inputIndex + 1);
  };

  const clearValue = () => {
    setState({
      template: "",
      from: "",
      workdir: "",
      run: "",
      entrypoint: "",
      cmd: "",
      env: "",
      arg: "",
    });
    setInputComponents([]);
  };

  return fileSendCheck ? (
    <TransferMessage downloadedPercent={downloadedPercent} />
  ) : (
    <div className="App">
      <header className="App-header">
        <div className="form-div">
          {/* <select onChange={setTemplateForm}>
            {templateForms.map((templateForm) => {
              return (
                <option value={JSON.stringify(templateForm)} key={templateForm.template}>
                  {templateForm.template}
                </option>
              );
            })}
          </select>
          <input placeholder="from 입력~" name={"from"} value={state.from} onChange={valueOnChange} />
          <input placeholder="workdir 입력~" name={"workdir"} value={state.workdir} onChange={valueOnChange} />
          <input placeholder="run 입력~" name={"run"} value={state.run} onChange={valueOnChange} />
          <input
            placeholder="entry point 입력~"
            name={"entrypoint"}
            value={state.entrypoint}
            onChange={valueOnChange}
          />
          <input placeholder="cmd 입력~" name={"cmd"} value={state.cmd} onChange={valueOnChange} />
          <input placeholder="env 입력~" name={"env"} value={state.env} onChange={valueOnChange} />
          <input placeholder="arg 입력~" name={"arg"} value={state.arg} onChange={valueOnChange} /> */}
          <select onChange={setTemplateForm}>
            {templateForms.map((templateForm) => (
              <option value={JSON.stringify(templateForm)} key={templateForm.template}>
                {templateForm.template}
              </option>
            ))}
          </select>
          <div>
            {/* {inputComponents
              ? inputComponents.map((inputIndex: any, index: any) => (
                  <DockerFormInput
                    key={inputIndex}
                    inputIndex={inputIndex}
                    setInputIndex={setInputIndex}
                    setInputComponents={setInputComponents}
                    inputComponents={inputComponents}
                    // option={inputIndex}
                  />
                ))
              : ""} */}
            {newObject
              ? Object.keys(newObject).map((key, index) => {
                  let key1 = parseInt(key);
                  // console.log(Object.values(newObject)[key1][0]);
                  return (
                    <DockerFormInput
                      key={index}
                      inputIndex={index}
                      setInputIndex={setInputIndex}
                      setInputComponents={setInputComponents}
                      inputComponents={inputComponents}
                      option={Object.values(newObject)[key1]}
                    />
                  );
                })
              : ""}
            <button onClick={appendInput}>ADD</button>
          </div>
          <div className="filebtn-div">
            <label className="filebtn">
              프로젝트 선택
              <input
                placeholder="arg 입력~"
                type="file"
                name={"file"}
                // directory=""
                // webkitdirectory=""
                onChange={onChangeFile}
              />
            </label>
            <div className="fileName-div">{selectedFile ? selectedFile.name : ".tar파일 선택"}</div>
          </div>

          {/* <input onClick={handleFileUpload}>파일 첵크</input> */}
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

////// 일단 @type>react>index.d.ts 에서 AriaAttributes 부분에 다음처럼 인자 타입 명세
/* 'directory' ?: string;
				'webkitdirectory'?: string; */

// declare module "react" {
//   interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
//     // extends React's HTMLAttributes
//     directory?: string; // remember to make these attributes optional....
//     webkitdirectory?: string;
//   }
// }
