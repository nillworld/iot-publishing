import React, { useEffect, useState } from "react";
import "./App.css";

type Props = {
  ws: WebSocket | undefined;
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

  const setTemplateForm = (e: any) => {
    setState(JSON.parse(e.target.value));
  };

  const valueOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(JSON.stringify(state));
      ws.onmessage = (evt: MessageEvent) => {
        console.log(evt);
        console.log(evt.data);
      };
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
