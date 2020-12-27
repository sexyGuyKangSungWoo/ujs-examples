

const main = document.getElementById("main");

const client = new UJS.Client();


async function runApp(port) {
    await client.connect();
    const node = await client.spawnDocker({
        dependencies: {
            "express": null
        },
        alive: true,
        ports: [port],
        directories: {}
    });
    console.log("와 실행됨");
    console.log(1);


    // NODE NODE
    node.on("message", message => {
        console.log("메시지 받음::", message);
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

    node.execF(() => {
        const express = require("express");
        const app = express();

        const messageCallbacks = {
            runApp(port) {
                app.listen(port);
            },
            closeApp() {
                app.close();
            },
            addResponse(path, response) {
                app.get(path, (req, res) => {
                    res.send(response);
                });
            }
        };

        setInterval(() => {
            console.log("ANGANG");
        }, 500);
		
		onMessage(message => {
			console.log("메시지당", message);
			sendMessage(message + " 하이요");
		});

        //onMessage(message => messageCallbacks[message.type](...message.args));
        $.message = message => messageCallbacks[message.type](...message.args);
    });
    console.log("와 exec됨");
	
	node.sendMessage("HIHI");

    function sendMessage(type, ...args) {
        node.exec(`$.message(${JSON.stringify({
            type,
            args
        })})`);
    }
	
    sendMessage("runApp", port);

    function closeApp() {
        sendMessage("closeApp");
    }

    function addResponse(path, response) {
        sendMessage("addResponse", path, response);
    }
	
    document.getElementById("closeApp").addEventListener("click", () => {
        closeApp();
    });
    document.getElementById("add").addEventListener("click", () => {
        const path = document.getElementById("path").value;
        const response = document.getElementById("response").value;
        {
            const div = document.createElement("div");
            div.appendChild(new Text(`:::::: ${path} ::::::`));
            const childDiv = document.createElement("div");
            childDiv.appendChild(new Text(`${response}`));
            div.appendChild(childDiv);
            document.getElementById("paths").appendChild(div);
        }
        addResponse(path, response);
        document.getElementById("path").value = "";
        document.getElementById("response").value = "";
        alert("등록 성공!");
    });


}

(() => { 
    // DOM
    document.getElementById("runApp").addEventListener("click", () => {
        runApp(parseInt(document.getElementById("port").value));
    });
})();