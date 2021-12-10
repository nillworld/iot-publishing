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

  // let file: File;

  const fileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.preventDefault();
    // const target = e.currentTarget;
    // if (e.target.files && e.target.files.length > 0) {
    //   file = e.target.files[0];
    //   console.log(file);
    // }
    // const file = target.files![0];
    // let file = e.target.files[0];
  };

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

  // https://www.google.com/search?q=WebSocket+%EB%8C%80%EC%9A%A9%EB%9F%89+%ED%8C%8C%EC%9D%BC+%EC%97%85%EB%A1%9C%EB%93%9C&sa=X&ved=2ahUKEwjqpJ7fh9b0AhWusVYBHbuzCKUQ1QJ6BAgdEAE&biw=1745&bih=852&dpr=1.1

  // https://stackoverflow.com/questions/11080112/large-file-upload-with-websocket
  const sliceSize = 1024 * 1024;
  const [slices, setSlices] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);
  useEffect(() => {
    setCurrentSlice(0);
  }, [slices]);

  function FileSlicer(file: any) {
    // randomly picked 1MB slices,
    // I don't think this size is important for this experiment
    // this.sliceSize = 1024 * 1024;
    // this.slices = Math.ceil(file.size / sliceSize);
    // this.currentSlice = 0;
    // this.getNextSlice = function () {
    //   var start = this.currentSlice * this.sliceSize;
    //   var end = Math.min((this.currentSlice + 1) * this.sliceSize, file.size);
    //   ++this.currentSlice;
    //   return file.slice(start, end);
    // };
  }

  function Uploader(e: any) {
    setSelectedFile(e.target.files[0]);
    if (file) {
      console.log(e.target.files[0]);
      console.log("살려줘", e.target.value);
      console.log("size", file.size);
      // var fs = new FileSlicer(file);
      setSlices(Math.ceil(file.size / sliceSize));
      console.log(Math.ceil(file.size / sliceSize));
      console.log(slices);
      setCurrentSlice(0);
      const getNextSlice = () => {
        let start = currentSlice * sliceSize;
        let end = Math.min((currentSlice + 1) * sliceSize, file.size);
        setCurrentSlice(currentSlice + 1);
        console.log(file, "eee");
        return file.slice(start, end);
      };
      // var socket = new WebSocket(url);
      console.log("안녕");
      // ws.onopen = function () {
      for (var i = 0; i < slices; ++i) {
        console.log(file.size);
        if (ws) {
          ws.send(getNextSlice()); // see below
        }
      }
    }
    // };
  }
  const [file, setSelectedFile] = useState<File>();

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleFileUpload = () => {
    Uploader(file);
    // if (selectedFile) {
    // const formData = new FormData();

    // formData.append("userfile", selectedFile, selectedFile.name);
    // console.log(formData);
    // ws.send(formData.userfile);
    // }
  };

  const setTemplateForm = (e: any) => {
    // const { name, value } = templateForms[0];
    // setState({ ...state, [name]: value });
    // console.log(e.target.value);
    setState(JSON.parse(e.target.value));
  };

  const valueOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(JSON.stringify(state));
      // ws.send(file);
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
          <input placeholder="arg 입력~" type="file" name={"file"} onChange={handleFileChange} />
          <div>
            <button onClick={sendMessage}>메세지 보내기</button>
            <button onClick={handleFileUpload}>파일 첵크</button>
            <button onClick={clearValue}>초기화</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default DockerForm;
