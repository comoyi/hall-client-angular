import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Message[];
  connect: WebSocket;
  input: String;
  @ViewChild('messageInput') messageInput: ElementRef;
  @ViewChild('messageList') messageList: ElementRef;

  constructor() { }

  ngOnInit() {
    if (!window["WebSocket"]) {
      alert("Your browser does not support websocket");
      return;
    }
    this.messageInput.nativeElement.focus();
    this.messages = [];
    var server = new WebSocket("ws://127.0.0.1:8080/ws");
    this.connect = server;
    server.onmessage = (ev) => { this.onMessage(ev) };
    server.onclose = () => { this.onClose() };
  }

  onMessage(ev) {
    var data = ev.data;
    var packet = JSON.parse(data);
    // TODO 根据消息包数据做具体操作，目前全部消息作为聊天内容
    var message = packet.data[0].msg; // 目前一个包一条消息，也不考虑cmd
    var m = new Message();
    m.type = message.type;
    m.content = message.content;
    this.messages = this.messages.concat(m);
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.firstChild.clientHeight;
  }

  onClose() {
    console.log("Connection closed");
  }

  handleMessageInputChange(e) {
    this.input = e.target.value;
  }

  handleSendMessage(e) {
    if (!this.connect) {
      return false;
    }
    if (!this.input) {
      return false;
    }
    var message = {
      'type': 1,
      'content': this.input,
    };
    // TODO 完善消息包数据
    var packet = {
      "packageId": "",
      "clientId": "",
      "packageType": "",
      "token": "",
      "data": [
        // {"cmd":"Ping"},
        // 目前一个包一条消息
        {
          "cmd": "GlobalMessage",
          "msg": message
        }
      ]
    };
    this.connect.send(JSON.stringify(packet));
    this.input = '';
    this.messageInput.nativeElement.focus();
  }
}

export class Message {
  type
  content;
}