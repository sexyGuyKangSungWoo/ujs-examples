const loading = document.getElementById('loading');
const main = document.getElementById('main');

const client = new UJS.Client();

(async () => {
    await client.connect();
    const node = await client.spawnDocker({
        dependencies: {
            'flying-squid': null,
            'minecraft-data': null,
        },
        ports: [25565],
        directories: {},
        alive: true
    });


    // NODE NODE
    node.on('message', message => {
        console.log('메시지 받음', message);
    });

    node.on('error', message => {
        console.log('오류남', message);
    });

    node.on('close', message => {
        console.log('엌 꺼짐' + message);
    });

    node.on('stdout', data => {console.log(data)});
    node.on('stderr', data => {console.log('err', data)});

    node.execF(() => {
        const mcServer = require('flying-squid');
        
        let option = {
            'motd': 'A Minecraft Server with UJS',
            'port': 25565,
            'max-players': 10,
            'online-mode': true,
            'logging': true,
            'gameMode': 1,
            'difficulty': 1,
            'worldFolder':'world',
            'generation': {
                'name': 'diamond_square',
                'options':{
                'worldHeight': 80
                }
            },
            'kickTimeout': 10000,
            'plugins': {
    
            },
            'modpe': false,
            'view-distance': 10,
            'player-list-text': {
                'header':'Flying squid',
                'footer':'Test server'
            },
            'everybody-op': true,
            'max-entities': 100,
            'version': '1.16.1'
        };

        onMessage(async (message) => {
            if(message.type == 'runApp'){
                mcServer.createMCServer(option);
            }
            else if  (message.type == 'editOption'){
                option = message.option;
                console.log(option);
            }
        });
    });

    function runApp() {
        node.sendMessage({type: 'runApp'});
    }

    function editOption(option){
        node.sendMessage({type: 'editOption', option});
    }

    // DOM
    let option = {
        'motd': 'A Minecraft Server with UJS',
        'port': 25565,
        'max-players': 10,
        'online-mode': true,
        'logging': true,
        'gameMode': 1,
        'difficulty': 1,
        'worldFolder':'world',
        'generation': {
            'name': 'diamond_square',
            'options':{
            'worldHeight': 80
            }
        },
        'kickTimeout': 10000,
        'plugins': {

        },
        'modpe': false,
        'view-distance': 10,
        'player-list-text': {
            'header':'Flying squid',
            'footer':'Test server'
        },
        'everybody-op': true,
        'max-entities': 100,
        'version': '1.16.1'
    }
    editOption(option);

    // LOAD MAIN
    loading.style.display = 'none';
    main.style.display = 'flex';

    // DOM
    const startBtn = document.getElementById('startBtn')

    const inputList = document.getElementsByTagName('input');

    function save(){
        for(let i in inputList){
            if(inputList[i].type === 'number')
                option[inputList[i].id] = parseInt(inputList[i].value);
            else if(inputList[i].type === 'checkbox')
                option[inputList[i].id] = inputList[i].checked;
            else if(inputList[i].type === 'text')
                option[inputList[i].id] = inputList[i].value;
        }
        editOption(option);
    }

    function disable(){
        for(let i in inputList){
            inputList[i].disabled = true;
        }
        startBtn.classList.add('disabledBtn');
        startBtn.innerHTML = '✔'
        startBtn.onclick = () => {}
    }

    startBtn.onclick = () => {
        save();
        disable();
        runApp();
    }
})();