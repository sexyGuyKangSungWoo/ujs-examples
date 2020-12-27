const loading = document.getElementById("loading");
const main = document.getElementById("main");

const client = new UJS.Client();

(async () => {
    await client.connect();
    const node = await client.spawnNode({
        dependencies: {
            "discord.js": null
        },
        alive: true
    });

    // LOAD MAIN
    loading.style.display = "none";
    main.style.display = "flex";


    // NODE NODE
    node.on("message", message => {
        console.log("메시지 받음", message);
    });

    node.on("error", message => {
        console.log("오류남", message);
    });

    node.on("close", message => {
        console.log("엌 꺼짐" + message);
    });

    node.on("stdout", data => {console.log(data)});
    node.on("stderr", data => {console.log('err', data)});

    node.execF(() => {
        const Discord = require('discord.js');
        const client = new Discord.Client();

        $.triggerWord = ['ping']
        $.responseWord = ['Pong!']
        
        $.regList = []
        $.expList = []

        function template(text = '', msg){
            const now = new Date();
            return(
                    // 보낸이
                text.replace(/{sender}/gi, msg.author.username)
                    .replace(/{senderTag}/gi, msg.author.tag)
                    .replace(/{hour}/gi, now.getHours())
                    // 시간
                    .replace(/{min}/gi, now.getMinutes())
                    .replace(/{sec}/gi, now.getSeconds())
                    .replace(/{millisec}/gi, now.getMilliseconds())
                    // 날자
                    .replace(/{year}/gi, now.getFullYear())
                    .replace(/{month}/gi, now.getMonth()+1)
                    .replace(/{day}/gi, now.getDay())
            );
        }

        client.on('ready', () => {
            // console.log(`Logged in as ${client.user.tag}!`);
        });

        function dictEval(text, dict){
            with(dict) {
                return eval(`${text}`);
            }
        }

        client.on('message', (msg) => {
            let index = $.triggerWord.indexOf(msg.content);
            if(msg.author == client.user) return;
            if (index !== -1){
                let text = $.responseWord[index];
                text = template(text, msg);
                msg.channel.send(text);
            }
            for(let i in $.regList){
                if(msg.content.match($.regList[i])){
                    const reg = $.regList[i];
                    const dict = reg.exec(msg.content)
                    const result = dictEval($.expList[i], dict.groups);
                    msg.channel.send(String(result));
                    break;
                }
            }
        });
        
        const messageCallbacks = {
            runApp(token) {
                client.login(token);
            },
            addTriggerWord(trigger, res) {
                $.triggerWord.push(trigger);
                $.responseWord.push(res);
            },
            deleteWord(trigger){
                const index = $.triggerWord.indexOf(trigger);
                $.triggerWord.splice(index, 1);
                $.responseWord.splice(index, 1);
            },
            addReg(regStr, res){
                $.regList.push(new RegExp(regStr));
                $.expList.push(res);
            },
            delReg(regStr){
                const index = $.regList.indexOf(new RegExp(regStr));
                $.regList.splice(index, 1);
                $.expList.splice(index, 1);
            }
        };

        //onMessage(message => messageCallbacks[message.type](...message.args));
        $.message = message => messageCallbacks[message.type](...message.args);
    });

    function sendMessage(type, ...args) {
        node.exec(`$.message(${JSON.stringify({
            type,
            args
        })})`);
    }

    function runApp(token) {
        sendMessage("runApp", token);
    }

    function addTriggerWord(trigger, response) {
        sendMessage("addTriggerWord", trigger, response);
    }
    function deleteWord(trigger){
        sendMessage("deleteWord", trigger);
    }
    function addReg(regStr, exp){
        sendMessage('addReg', regStr, exp);
    }
    function delReg(regStr){
        sendMessage('delReg', regStr);
    }

    // DOM

    const startButton = document.getElementById("runApp");
    const addButton = document.getElementById("add");

    const openInfo = document.getElementById('openInfo');
    const closeInfo = document.getElementById('closeInfo');

    const dropBtn = document.getElementById('dropBtn');
    const info = document.getElementById('info');
    const dropItems = document.getElementsByClassName('dropdown-item');
    const secondInputLabel = document.getElementById('secondInputLabel');

    for(let i = 0; i < dropItems.length; i++){
        dropItems[i].onclick = (event) => {
            const temp = event.target.innerHTML;
            event.target.innerHTML = dropBtn.innerHTML;
            dropBtn.innerHTML = temp;
            if(dropBtn.innerHTML == 'reg'){
                secondInputLabel.innerHTML = 'exp'
            }else if(dropBtn.innerHTML == 'req'){
                secondInputLabel.innerHTML = 'res'
            }
        }
    }

    function onDeleteWordClicked(event){
        const row = event.target.parentElement;
        const triggerWord = row.children[3].innerHTML;
        if(event.target.id == 'reg'){
            delReg(triggerWord);
        }else{
            deleteWord(triggerWord);
        }
        row.remove();
    }
    openInfo.onclick = (event) => {
        info.style.position = 'fixed';
        info.style.display = 'block';
        info.style.left = `${event.pageX}px`;
        info.style.top = `${event.pageY}px`;
        info.style.zIndex = '9';
    }
    closeInfo.onclick = (event) => {
        info.style.display = 'none';
    }
    startButton.addEventListener("click", () => {
        runApp(document.getElementById("token").value);
        startButton.className = 'btn btn-outline-success';
        startButton.innerHTML = '✔';
        startButton.disabled = true;
    });
    addButton.addEventListener("click", () => {
        const path = document.getElementById("path").value;
        const response = document.getElementById("response").value;

        const div = document.createElement("div");
        div.className = 'row';

        const req = document.createElement('code');
        const res = document.createElement('code');
        const delBtn = document.createElement('div');
        req.className = 'col-5';
        res.className = 'col-5';
        delBtn.className = 'col-2';
        req.innerHTML = path.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        res.innerHTML = response.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        delBtn.innerHTML = '삭제';
        delBtn.onclick = onDeleteWordClicked;
        div.appendChild(req);
        div.appendChild(res);
        div.appendChild(delBtn);
        document.getElementById("paths").appendChild(div);

        const original1 = document.createElement('input');
        const original2 = document.createElement('input');
        original1.value = path;
        original2.value = response;
        original1.type = 'hidden';
        original2.type = 'hidden';
        div.appendChild(original1);
        div.appendChild(original2);

        if(dropBtn.innerHTML == 'req'){
            addTriggerWord(path, response);
        }
        else if(dropBtn.innerHTML == 'reg'){
            addReg(path, response);
            delBtn.id = 'reg'
        }
        document.getElementById("path").value = "";
        document.getElementById("response").value = "";
        alert("등록 성공!");
    });


    document.querySelector('#paths > div:nth-child(2) > div.col-2').onclick = onDeleteWordClicked;
})();