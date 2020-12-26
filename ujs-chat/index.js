

const main = document.getElementById("main");
const nicknameInput = document.getElementById("nickname");
const chatInput = document.getElementById("chat");
const submitBtn = document.getElementById("submit");
const ipSpan = document.getElementById("ip");
const serverBtn = document.getElementById("server");
const clientBtn = document.getElementById("client");
const chats = document.getElementById("chats");


async function runServer() {
    const client = new UJS.Client();

    await client.connect();
    const node = await client.spawnDocker({
        dependencies: {
            "socket.io": "3.0.4",
            "external-ip": "2.3.1",
            "express": "4.17.1",
            "cors": "2.8.5"
        },
        alive: true,
        ports: [54321],
        directories: {}
    });


    // NODE NODE
    node.on("message", message => {
        console.log("메시지 받음::", message);
        if(message.type === "ip") {
            const ip = message.ip;
            ipSpan.innerText = ip;
            runClient("127.0.0.1");
        }
    });

    node.on("error", message => {
        console.log("오류남::", message);
    });

    node.on("stdout", message => {
        console.log(message);
    });

    node.on("stderr", message => {
        console.log("오류::", message);
    });

    node.on("close", message => {
        console.log("엌 꺼짐::", message);
    });

    node.execF(async () => {
        const fs = require("fs");
        const path = require("path");
        const express = require("express");
        const cors = require("cors");
        const http = require("http");
        const { promisify } = require("util");
        const getIP = promisify(require("external-ip")());

        // CHATS
        const CHATS_PATH = path.resolve(dirs.__workspace, "./chats.json");

        let chats = [];

        async function loadChats() {
            if(!fs.existsSync(path.resolve(dirs.__workspace, "./chats.json"))) {
                await saveChats();
            }
            chats = JSON.parse(await fs.promises.readFile(CHATS_PATH));
        }

        async function saveChats() {
            await fs.promises.writeFile(CHATS_PATH, JSON.stringify(chats));
        }

        await loadChats();


        // IP
        const ip = await getIP();


        // SERVER
        const app = express();
        app.use(cors({ origin:"*" }));

        const server = http.createServer(app);
        const io = require("socket.io")(server, {
            cors: {
                origin: "*"
            }
        });
        server.listen(54321);

        io.on("connect", socket => {
            socket.emit("chats", chats);
            socket.on("message", msg => {
                io.emit("message", msg);
                chats.push({
                    nickname: msg.nickname,
                    chat: msg.chat
                });
            });
        });

        sendMessage({
            type:"ip",
            ip
        });

        setInterval(async () => {
            await saveChats();
        }, 1000);
    });
}

async function runClient(addr) {
    const socket = io("http://" + addr + ":54321");

    function addChat({nickname, chat}) {
        const div = document.createElement("div");
        div.appendChild(new Text(nickname));
        div.appendChild(new Text(" : "));
        div.appendChild(new Text(chat));
        chats.appendChild(div);
        window.scrollTo(0,document.body.scrollHeight);
    }

    socket.on("chats", chats => {
        chats.forEach(addChat);
    });
    
    socket.on("message", addChat);


    // DOM
    document.addEventListener("keypress", e => {
        if(e.key == 'Enter')
        {
            socket.emit("message", {
                nickname: nicknameInput.value,
                chat: chatInput.value
            });
        }
    });
}



serverBtn.addEventListener("click", async e => {
    await runServer(); //서버면 client도 자동 실행 됨
});

clientBtn.addEventListener("click", async e => {
    const addr = prompt("서버의 주소는??");
    await runClient(addr);
});