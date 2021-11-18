import React from 'react';
import './App.css';
import { exec } from 'child_process';

class App extends React.Component {
  ws: any;
  state = { from: '', workdir: '', run: '', entrypoint: '', cmd: '', env: '', arg: '' };

  componentDidMount() {
    this.ws = new WebSocket('ws://localhost:1234/ws'); // 아까 서버에서 1234 port로 했으니 이런식으로
    this.ws.onopen = () => {
      // 연결!
      console.log('connected!!');
    };
  }
  sendMessage = () => {
    // 화살표함수로 만들것!!
    this.ws.send(JSON.stringify(this.state)); // 서버로 메세지 보내는건 send
    this.ws.onmessage = (evt: MessageEvent) => {
      console.log(evt);
      console.log(evt.data);
      // exec('tar cvf deployFiles/project.tar ../projext', (err, out, stderr) => {
      //   console.log(out);
      // });
    };
  };
  valueOnChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value });
    // this.state.value = e.target.value;
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <input placeholder="from 입력~" name={'from'} onChange={this.valueOnChange} />
          <input placeholder="workdir 입력~" name={'workdir'} onChange={this.valueOnChange} />
          <input placeholder="run 입력~" name={'run'} onChange={this.valueOnChange} />
          <input placeholder="entry point 입력~" name={'entrypoint'} onChange={this.valueOnChange} />
          <input placeholder="cmd 입력~" name={'cmd'} onChange={this.valueOnChange} />
          <input placeholder="env 입력~" name={'env'} onChange={this.valueOnChange} />
          <input placeholder="arg 입력~" name={'arg'} onChange={this.valueOnChange} />
          <button onClick={this.sendMessage}>메세지 보내기</button>
        </header>
      </div>
    );
  }
}

export default App;
