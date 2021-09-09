
// const
//     socks5 = require('simple-socks'),
//     server = socks5.createServer();

// // start listening!
// server.listen(1080, '0.0.0.0', function () {
//     console.log('SOCKS5 proxy server started on 0.0.0.0:1080');
// });

// server.on('handshake', function (socket) {
//     console.log();
//     console.log('------------------------------------------------------------');
//     console.log('new socks5 client from %s:%d', socket.remoteAddress, socket.remotePort);
// });

// // When a reqest arrives for a remote destination
// server.on('proxyConnect', function (info, destination) {
//     console.log('connected to remote server at %s:%d', info.address, info.port);

//     destination.on('data', function (data) {
//         console.log(data.length);
//     });
// });

// server.on('proxyData', function (data) {
//     console.log(data.length);
// });

// // When an error occurs connecting to remote destination
// server.on('proxyError', function (err) {
//     console.error('unable to connect to remote server');
//     console.error(err);
// });

// // When a request for a remote destination ends
// server.on('proxyDisconnect', function (originInfo, destinationInfo, hadError) {
//     console.log(
//         'client %s:%d request has disconnected from remote server at %s:%d with %serror',
//         originInfo.address,
//         originInfo.port,
//         destinationInfo.address,
//         destinationInfo.port,
//         hadError ? '' : 'no ');
// });

// // When a proxy connection ends
// server.on('proxyEnd', function (response, args) {
//     console.log('socket closed with code %d', response);
//     console.log(args);
//     console.log();
// });

var Agent = require('socks5-https-client/lib/Agent');

request({
    url: 'https://encrypted.google.com/',
    strictSSL: true,
    agentClass: Agent,
    agentOptions: {
        socksHost: 'https://sinaproxy1.herokuapp.com', // Defaults to 'localhost'.
        socksPort: 1080, // Defaults to 1080.

        // Optional credentials
        socksUsername: 'sina',
        socksPassword: 'mashini',
    }
}, function (err, res) {
    console.log(err || res.body);
});