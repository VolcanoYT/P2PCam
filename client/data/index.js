import {
    io
} from "socket.io-client";
import axios from 'axios';
import {
    Buffer
} from 'buffer';
import {
    spawn
} from 'child_process';

const app = require('express')();
const http = require('http').Server(app);
var os = require('os');

var port_client = process.env.PORT || 3000;

var server_ip = process.env.SERVER || '192.168.11.254';
var server_port = process.env.SERVER || 3001;

//tmp var
var camera_online = false;
var rtsp_online = false;
var camera_startup = Math.floor(Date.now() / 1000);
var camera_ippublic = '127.0.0.1';
var camera_ipprivate = '127.0.0.1';
var child = null;

//need gui

// cam 2 = rtsp://192.168.11.253:8554/unicast

var sn_cam = 123;
var token_cam = 423;
var quality_cam = 50;
var fps_cam=10;
var resolution_cam='858x480';
var cam_rtsp="rtsp://192.168.11.253:8554/unicast";

var detail_cam = {
    sn: sn_cam,
    token: token_cam,
    ping: camera_startup
};

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to API P2P Camera for Client"
    });
});

app.get('/ping', (req, res) => {
    res.json(detail_cam);
});

//TODO: send info my ip and local info etc etnc
var CamServer = io('http://' + server_ip + ':' + server_port + '/server', {
    query: detail_cam,
    transports: ['websocket']
});

// if server online
CamServer.on('connect', (connected) => {
    console.log('debug_connected', connected);
    camera_online = true;

    axios.get('http://ifconfig.me/ip').then(function (response) {

        //TODO: what about if faild
        camera_ippublic = response.data;
        detail_cam.ip_public = camera_ippublic;

        //console.log(response);
    }).catch(function (error) {
        // handle error
        console.log(error);
    })

    var networkInterfaces = os.networkInterfaces();
    try {

        camera_ipprivate = networkInterfaces.eth0[0].address;
        detail_cam.ip_private = camera_ipprivate;

        //console.log('more info lan: ',networkInterfaces);
    } catch (error) {
        console.log(error);
    }

    start_rtsp();

});

// if server down
CamServer.on('disconnect', (disconnect) => {
    console.log('debug_discounnet', disconnect);
    camera_online = false;
})

// if server have error?
CamServer.on('error', (error) => {
    console.log('debug_error', error);
});

// if server close it?
CamServer.on("close", (close) => {
    console.log('debug_close', close);
});

http.listen(port_client, () => {
    console.log('Client P2P Camera Online with Port ' + port_client);
});

// Should we ping manually or just wait image data?
setInterval(function () {
    if (camera_online) {

        detail_cam.startup = Math.floor(Date.now() / 1000);
        /*        
        CamServer.emit('client', {
            type: 'ping',
            data: detail_cam,
        });
        */

    }
}, 3000);

function start_rtsp() {

    var buff = Buffer.from('');
    var sadd = parseInt(1000 / (31 * quality_cam) * 10);
    var cmd1 = [];
    var cmd_v2 = cmd1.concat(
       ['-loglevel', 'warning',],
        //['-analyzeduration', '2147483647'],
       // ['-probesize', '2147483647'],
        //-analyzeduration 2147483647 -probesize 2147483647
       // (!isEmpty(this.ff_headers)) ? ['-headers', this.ff_headers] : [],
        //(!isEmpty(this.ff_proxy)) ? ['-http_proxy', this.ff_proxy] : [],
       // (!isEmpty(this.ff_need)) ? ['-rtsp_transport', this.ff_need] : [],
       ['-rtsp_transport', 'tcp'],
       //['-f', 'h264'],
        [
            '-re',
            '-i', cam_rtsp,
          //  '-vcodec','libx264',
            '-r', fps_cam,
            '-q:v', sadd.toString(),
            '-s', resolution_cam,
            '-f', 'image2',
            '-update', '1',
            '-an',
            '-'
        ]);

    //for debug
    console.log('start stream...', cmd_v2.join(" "));

    child = spawn('ffmpeg', cmd_v2);
    child.stdout.on('data', function (data) {
        if (data.length > 1) {
            try {
                buff = Buffer.concat([buff, data]);
                var offset = data[data.length - 2].toString(16);
                var offset2 = data[data.length - 1].toString(16);
                // The image can be composed of one or multiple chunk when receiving stream data.
                // Store all bytes into an array until we meet flag "FF D9" that mean it's the end of the image then we can send all data in order to display the full image.
                if (offset == "ff" && offset2 == "d9") {
                    //ping to server?
                    console.log('got data for tesing');
                    buff = Buffer.from('');
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
    child.stderr.on('data', function (data) {
        var deb = String(data);
        console.log('debug_ff_error',deb);
    });
    child.on('exit', function (code) {
        console.log('ff exit with code: ',code);
    });

}

function kill_rtsp() {

}