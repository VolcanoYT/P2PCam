const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var port_server = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to API P2P Camera for Server"
    });
});

io.of('/server').on('connection', (connected) => {

    var ip_user = "";
    var id_user = connected.id;
    var query = connected.handshake.query;

    try {
        ip_user = connected.handshake.headers['cf-connecting-ip'] || connected.handshake.headers['X-Real-IP'] || connected.handshake.headers['x-forwarded-for'] || connected.handshake.address;
    } catch (error) {
        console.log(error);
    }
    
    console.log("Connect Server P2P Camera " + id_user + " | IP " + ip_user + " ",query);

    connected.on('client', function (e) {
        
        console.log("client",e);

    });

    connected.on('disconnect', function () {
        
        console.log("Disconnect Server P2P Camera " + id_user + " | IP " + ip_user + " ");

    });

});

http.listen(port_server, () => {
    console.log('Server P2P Camera Online with Port '+port_server);
});