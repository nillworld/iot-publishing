"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var fs = __importStar(require("fs"));
var child_process_1 = require("child_process");
var WebSocketS = require('ws').Server;
var Server = /** @class */ (function () {
    function Server() {
        this.clients = [];
        this.wss = null;
        this.server = null;
    }
    Server.prototype.start = function (port) {
        var _this = this;
        this.wss = new WebSocketS({ port: port }); // 내가 설정한 port로 websocket 서버를 연다
        console.log('WebSocket Initialized', port);
        //웹소켓 연결 핸들러, 연결이 되면 진행됨!
        this.wss.on('connection', function (ws) {
            _this.clients.push(ws);
            console.log('Connected total:', _this.clients.length);
            //메세지 핸들러,클라이언트가 메세지를 보내게되면 여기서 받는다.
            ws.on('message', function (message) {
                var options = JSON.parse(message);
                console.log('check!', options);
                fs.writeFile('../project/Dockerfile', "FROM ".concat(options.from ? "".concat(options.from) : "node:12", "\nLABEL name=\"test@gmail.com\"\n").concat(options.workdir ? "WORKDIR ".concat(options.workdir, "\n") : "", "RUN \"").concat(options.run ? "".concat(options.from) : "npm install --silent", "\"\nADD . /app\nENTRYPOINT [\"").concat(options.entrypoint ? "".concat(options.entrypoint) : "node", "\"]\nCMD [\"").concat(options.cmd ? "".concat(options.cmd) : "index.js", "\"]\n").concat(options.env ? "ENV ".concat(options.env, "\n") : "").concat(options.arg ? "ARG ".concat(options.arg) : ""), function (err) {
                    if (err === null) {
                        console.log('success');
                        (0, child_process_1.exec)('cd ../ && tar cvf project.tar project', function (err, out, stderr) {
                            ws.send('out the "project.tar" file');
                        });
                    }
                    else {
                        console.log('fail');
                    }
                });
                console.log('received: %s', message);
                ws.send('Good, Nice to meet you, Iam server');
            });
        });
        this.wss.on('close', function (error) {
            console.log('websever close', error);
        });
        this.wss.on('error', function (error) {
            console.log(error);
        });
    };
    return Server;
}());
exports.Server = Server;
