

const loading = document.getElementById("loading");
const main = document.getElementById("main");
const url = document.getElementById("url");
const download = document.getElementById("download");
const resultPath = document.getElementById("resultPath");

const client = new UJS.Client();

(async () => {
    await client.connect();
    const node = await client.spawnDocker({
        dependencies: {
            "ytdl-core": "4.2.1"
        },
        alive: true,
        ports: [],
        directories: {}
    });
    console.log("와 실행됨");
    console.log(1);

    // LOAD MAIN
    loading.style.display = "none";
    main.style.display = "flex";


    // NODE NODE
    node.on("message", message => {
        console.log("메시지 받음::", message);
        if(message.type === "resultPath") {
            const path = message.path;
            resultPath.innerText = path;
        }
        else if(message.type === 'info'){
            addVideoList(message.info);
        }
        else if(message.type === 'downloaded'){
            finishDownload(message.info);
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

    node.execF(() => {
        const fs = require("fs");
        const path = require("path");
        const ytdl = require("ytdl-core");

        console.log(dirs, rDirs);
        onMessage(async message => {
            if(message.type === "download") {
                const videoID = ytdl.getURLVideoID(message.url);
                const info = await ytdl.getInfo(videoID);
                sendMessage({
                    type:"info",
                    info
                });
                const down = ytdl(message.url)
                down.pipe(fs.createWriteStream(path.resolve(dirs.__workspace, info.videoDetails.title+".mp4")));
                down.on('end', ()=>{
                    sendMessage({
                        type:"downloaded",
                        info
                    });
                })
            }
        });
        sendMessage({
            type:"resultPath",
            path: rDirs.__workspace
        });
    });

    const comma = str => str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');

    function addVideoList(info){    //example on html
        const videoDetails = info.videoDetails;
        console.log(videoDetails);
        
        const videoList = document.getElementById('videoList');

        // DOM CODE ========================================================================

        // <li id="{videoId}" class="videoLi">
        const videoLi = document.createElement('div');
        videoLi.className = 'videoLi';
        videoLi.id = videoDetails.videoId;
        
            // <img src="https://i.ytimg.com/vi/{비디오 id}/hqdefault.jpg" alt="{비디오 제목}">
            const thumbnail = document.createElement('img');
            thumbnail.alt = videoDetails.title;
            thumbnail.src = `https://i.ytimg.com/vi/${videoDetails.videoId}/hqdefault.jpg`;
            videoLi.append(thumbnail);

            // <div class="detail">
            const detail = document.createElement('div');
            detail.className = 'detail';
            videoLi.append(detail);

                // <span class="title">{영상제목}</span>
                const title = document.createElement('span');
                title.className = 'title';
                title.innerHTML = videoDetails.title;
                detail.append(title);

                // <span class="uploader">{업로더}</span>
                const uploader = document.createElement('span');
                uploader.className = 'uploader';
                uploader.innerHTML = videoDetails.author.name;
                detail.append(uploader);

                // <span class="view">{조회수}</span>
                const view = document.createElement('span');
                view.className = 'view';
                view.innerHTML = 'view: '+ comma(info.player_response.videoDetails.viewCount);
                detail.append(view);

            // </div>

            // <span class="sm-load"></span>
            const loading = document.createElement('span');
            loading.className = 'sm-load';
            videoLi.append(loading);
        // </li>

        videoList.append(videoLi);
    }

    function finishDownload(info){
        const load = document.querySelector(`#${info.videoDetails.videoId} > .sm-load`);
        load.className = 'material-icons md-light';
        load.innerHTML = 'done';
    }

    // DOM
    download.addEventListener("click", e => {
        node.sendMessage({type:"download", url:url.value});
        url.value = "";
    });
})();