import React, { useEffect, useState } from "react";
import "./App.css";
import "./DockerForm.css";

type Props = {
  ws: WebSocket | undefined;
};
type MessageType = {
  state: string;
};

function DockerForm(props: Props) {
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
  const [messageHandler, setMessageHandler] = useState<MessageType>({ state: "dockerForm" });
  const [selectedFile, setSelectedFile] = useState<File>();

  const setTemplateForm = (e: any) => {
    setState(JSON.parse(e.target.value));
  };

  const valueOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const onChangeFile = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const sendMessage = () => {
    const reader = new FileReader();
    const fileName = selectedFile?.name;
    const fileSize = selectedFile?.size;
    const bufferSize = 1024;
    let pos = 0;
    if (selectedFile) {
      reader.readAsArrayBuffer(selectedFile);
      console.log(selectedFile.name);

      if (ws) {
        ws.send(JSON.stringify(state));
        ws.onmessage = (message) => {
          let sendChecker = JSON.parse(message.data).sendChecker;
          let downloadedPercent = JSON.parse(message.data).downloadedPercent;
          const fileInfo = { fileName: fileName, fileSize: fileSize };
          if (sendChecker === "FILEINFO") {
            ws.send(JSON.stringify(fileInfo));
          } else if (sendChecker === "DATA") {
            while (pos != fileSize) {
              ws.send(selectedFile.slice(pos, pos + bufferSize));
              pos = pos + bufferSize;
              if (fileSize && pos > fileSize) {
                pos = fileSize;
              }
              //progressBarWidth = pos/fileSize*100;
              //console.log(progressBar.style.width);
              // widow.setInterval(setWidth, 500)
            }
            ws.send("DONE");

            console.log(fileList);
            //ws.close();
          } else if (sendChecker === "DOWNLOADING") {
            console.log(downloadedPercent);
            // progressBar.style.width = downloadedPercent;
          }
        };
      }
    }
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
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="form-div">
          <select onChange={setTemplateForm}>
            {templateForms.map((templateForm) => {
              // console.log(templateForm);
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
          <input placeholder="arg 입력~" name={"arg"} value={state.arg} onChange={valueOnChange} />
          <div className="filebtn-div">
            <label className="filebtn">
              프로젝트 선택
              <input placeholder="arg 입력~" type="file" name={"file"} onChange={onChangeFile} />
            </label>
            <div className="fileName-div">{selectedFile ? selectedFile.name : ""}</div>
          </div>

          {/* <input onClick={handleFileUpload}>파일 첵크</input> */}
          <div>
            <button onClick={sendMessage}>메세지 보내기</button>
            <button onClick={clearValue}>초기화</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default DockerForm;
