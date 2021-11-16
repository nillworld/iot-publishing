import * as fs from 'fs';
const WebSocketS = require('ws').Server;

export class Server {
  public clients: any = [];
  public wss: any = null;
  public server: any = null;

  public start(port: number) {
    this.wss = new WebSocketS({ port: port }); // 내가 설정한 port로 websocket 서버를 연다
    console.log('WebSocket Initialized', port);

    //웹소켓 연결 핸들러, 연결이 되면 진행됨!
    this.wss.on('connection', (ws: any) => {
      this.clients.push(ws);
      console.log('Connected total:', this.clients.length);

      //메세지 핸들러,클라이언트가 메세지를 보내게되면 여기서 받는다.
      ws.on('message', (message: string) => {
        const options = JSON.parse(message);
        fs.writeFile(
          './Dockerfile',
          `FROM ${options.from}
LABEL name=""
WORKDIR "${options.workdir}"
RUN "${options.run}"
ADD . /app
ENTRYPOINT ["${options.entrypoint}"]
CMD ["${options.cmd}"]
ENV ${options.env}
ARG ${options.arg}`,
          function (err) {
            if (err === null) {
              console.log('success');
            } else {
              console.log('fail');
            }
          }
        );
        console.log('received: %s', message);
        ws.send('Good, Nice to meet you, Iam server'); // 이 줄만 추가!
      });
    });
    this.wss.on('close', function (error: any) {
      console.log('websever close', error);
    });
    this.wss.on('error', function (error: any) {
      console.log(error);
    });
  }
}
