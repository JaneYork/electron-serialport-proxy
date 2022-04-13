window.$ = window.jQuery = require('./public/js/jquery.min.js')
// let serialport = require('serialport')
const { SerialPort } = require('serialport')
const { ipcRenderer } = require('electron')
// const ipcRenderer = require('electron').ipcRenderer
console.log('xxxx',SerialPort)
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
const util = require('./public/js/util.js');
const sptool = require('./public/js/serialport.js');

const http  = require('http')
const server = http.createServer((req,res) => {
    console.log('req',req)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("content-type", "application/json")
    const reg = /\/(\w+)\/(\w+)/
    const match = reg.exec(req.url)
    console.log('match',match)
    if(match){
        const [cate,type] = [match[1],match[2]]
        if(cate === 'rfid'){
            handleRFID(type).then(rfids => {
                console.log('request return',rfids)
                res.end(rfids.join('|'));
            }).catch(err => {
                // res.statusCode=404
                res.end(err)
            }).finally(()=>{
                port.close()
                port = null
            });
        }
    } else {
        res.end('error request')
    }
    // 更多串口
})
server.listen(9527);


let port = null;
let COM = null;
let BaudRate = 115200;
let parser = null;
let rfidSet = new Set();

// 初始化串口和波特率供选择
async function listSerialPorts() {
    await SerialPort.list().then((ports, err) => {
        if(err) {
            document.getElementById('error').textContent = err.message
            return
        } else {
            document.getElementById('error').textContent = ''
        }
        console.log('ports', ports);

        if (ports.length === 0) {
            document.getElementById('error').textContent = 'No ports discovered'
        }
        for (let item of ports) {
            $('.com').append(`<option>${item.path}</option>`)
        }
    })
}
listSerialPorts()
// SerialPort.list((err, ports) => {
//     for (let item of ports) {
//         $('.com').append(`<option>${item.comName}</option>`)
//     }
// });
const baudRates = [9600,115200,4800,19200]
baudRates.forEach(item => {
    $('.baud').append(`<option>${item}</option>`)
})

// 准备串口
function preparePort(){
    return new Promise(function(resolve,reject){
        if(!port){
            COM = $('#disabledSelect option:selected').text();
            BaudRate = $('#baudSelect option:selected').text();
            port = new SerialPort({
                path: COM,
                baudRate: parseInt(BaudRate)
            });
            port.on('open', function() {
                $('.receive-windows').text(`打开串口: ${COM}, 波特率: ${BaudRate}`);
                $('.receive-windows').append('<br/>=======================================<br/>');
            })
            // 如果发生错误
            port.on('error', err => {
                $('.receive-windows').append(err.toString());
                reject(err);
            });
        }
        resolve(port)
    })
}

function handleRFID(type){
    let sp = null;
    return new Promise(function(resolve,reject){
        preparePort().then(port => {
            parser = port.pipe(new InterByteTimeout({interval:5}))
            switch(type){
                case 'single':
                    sp = sptool.singleRead(port,parser)
                    break;
                case 'multi':
                    sp = sptool.multiRead(port,parser,100)
                    break;
                case 'bind':
                    sp = sptool.bind(port,parser)
                    break;
            }
            sp.then(rfids => {
                console.log('rfid result',rfids)
                resolve(rfids)
            }).catch(err => {reject(err)})
        })
    })
}

// 点击发送信息
$('.btn-send').click(() => {
    handleRFID('multi').then(rfids => {
        console.log('request return',rfids)
        $('.receive-windows').append(rfids.join(',') + '</br>');
    }).catch(err => {
        console.log(err);
        $('.receive-windows').append(err + '</br>');
    });
})

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

// 接收asynchronous-reply返回的消息
ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong"
})
// 向asynchronous-message发送消息
ipcRenderer.send('asynchronous-message', 'ping')

$("#debugCodeBtn").click(() => {
    if ("pgz" === $('#debugCode').val()) {
        console.log('start openDevTool')
        ipcRenderer.send('asynchronous-message', 'open-dev')
    }
})

// 清空信息
$('.btn-reset').click(() => {
    $('.receive-windows').text('');
})
