import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const ws = new WebSocket('ws://localhost:1234/ws'); // 아까 서버에서 1234 port로 했으니 이런식으로

  // const state = { from: '', workdir: '', run: '', entrypoint: '', cmd: '', env: '', arg: '' };
  const [state, setstate] = useState({ from: '', workdir: '', run: '', entrypoint: '', cmd: '', env: '', arg: '' });
  useEffect(() => {
    ws.onopen = () => {
      // 연결!
      console.log('connected!!');
    };
  });
  const sendMessage = () => {
    // 화살표함수로 만들것!!
    ws.send(JSON.stringify(state)); // 서버로 메세지 보내는건 send
    ws.onmessage = (evt: MessageEvent) => {
      console.log(evt);
      console.log(evt.data);
    };
  };
  const valueOnChange = (e: any) => {
    const { name, value } = e.target;
    () => setstate({ ...state, [name]: value });
    // this.state.value = e.target.value;
  };
  return (
    <div className="App">
      <header className="App-header">
        <input placeholder="from 입력~" name={'from'} onChange={valueOnChange} />
        <input placeholder="workdir 입력~" name={'workdir'} onChange={valueOnChange} />
        <input placeholder="run 입력~" name={'run'} onChange={valueOnChange} />
        <input placeholder="entry point 입력~" name={'entrypoint'} onChange={valueOnChange} />
        <input placeholder="cmd 입력~" name={'cmd'} onChange={valueOnChange} />
        <input placeholder="env 입력~" name={'env'} onChange={valueOnChange} />
        <input placeholder="arg 입력~" name={'arg'} onChange={valueOnChange} />
        <button onClick={sendMessage}>메세지 보내기</button>
      </header>
    </div>
  );
}

export default App;
