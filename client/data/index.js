import {
    io
} from "socket.io-client";
import axios from 'axios';

const app = require('express')();
const http = require('http').Server(app);
var os = require('os');

var port_client = process.env.PORT || 3000;

var server_ip = process.env.SERVER || '192.168.11.254';
var server_port = process.env.SERVER || 3001;

//tmp var
var camera_online    = false;
var camera_startup   = Math.floor(Date.now() / 1000);
var camera_ippublic  = '127.0.0.1';
var camera_ipprivate = '127.0.0.1';

//need gui
var sn_cam = 123;
var token_cam = 423;

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