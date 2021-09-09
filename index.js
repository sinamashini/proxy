const net = require('net');
const dns = require('dns');

let autherHandler = function (data) {
    let sock = this;
    console.log('autherHandler ', data);
    const version = parseInt(data[0], 10);
    if (version !== 5) {// other versions of socks protocol are not supported
        sock.destoryed || sock.destory();
        return false;
    }
    const methodbuf = data.slice(2); // method list

    let methods = [];
    for (let i = 0; i < methodBuf.length; i++)
        methods.push(methodBuf[i]);
    //Determine the account password first
    let kind = methods.find(method => method === authmethods.USERPASS);
    if (kind) {
        let buf = Buffer.from([version, authmethods.USERPASS]);
        sock.write(buf);
        sock.once('data', passwdHandler.bind(sock));
    } else {
        kind = methods.find(method => method === authmethods.NOAUTH);
        if (kind === 0) {
            let buf = Buffer.from([version, authmethods.NOAUTH]);
            sock.write(buf);
            sock.once('data', requestHandler.bind(sock));
        } else {
            let buf = Buffer.from([version, 0xff]);
            sock.write(buf);
            return false;
        }
    }

}

/**
 *Password of authentication account
 */
let passwdHandler = function (data) {
    let sock = this;
    console.log('data ', data);
    let ulen = parseInt(data[1], 10);
    let username = data.slice(2, 2 + ulen).toString('utf8');
    let password = data.slice(3 + ulen).toString('utf8');
    if (username === 'admin' && password === '123456') {
        sock.write(Buffer.from([5, 0]));
    } else {
        sock.write(Buffer.from([5, 1]));
        return false;
    }
    sock.once('data', requestHandler.bind(sock));
}

/**
 *Processing client requests
 */
let requestHandler = function (data) {
    let sock = this;
    const version = data[0];
    let CMD = data[1]; // 0x01 supports connect connection first
    if (cmd !== 1)
        console.Error('Other connection is not supported' + CMD);
    let flag = version === 5 && cmd < 4 && data[2] === 0;
    if (!flag)
        return false;
    let atyp = data[3];
    let host,
        port = data.slice(data.length - 2).readInt16BE(0);
    let copyBuf = Buffer.allocUnsafe(data.length);
    data.copy(copyBuf);
    if (atyp === 1) {// use IP connection
        host = hostname(data.slice(4, 8));
        //Start connecting to the host!
        connect(host, port, copyBuf, sock);

    } else if (atyp === 3) {// use domain name
        let len = parseInt(data[4], 10);
        host = data.slice(5, 5 + len).toString('utf8');
        if (!domainVerify(host)) {
            console.log('domain is fialure %s ', host);
            return false;
        }
        console.log('host %s', host);
        dns.lookup(host, (err, ip, version) => {
            if (err) {
                console.log(err)
                return;
            }
            connect(ip, port, copyBuf, sock);
        });

    }
}

let connect = function (host, port, data, sock) {
    if (port < 0 || host === '127.0.0.1')
        return;
    console.log('host %s port %d', host, port);
    let socket = new net.Socket();
    socket.connect(port, host, () => {
        data[1] = 0x00;
        if (sock.writable) {
            sock.write(data);
            sock.pipe(socket);
            socket.pipe(sock);
        }
    });

    socket.on('close', () => {
        socket.destroyed || socket.destroy();
    });

    socket.on('error', err => {
        if (err) {
            console.error('connect %s:%d err', host, port);
            data[1] = 0x03;
            if (sock.writable)
                sock.end(data);
            console.error(err);
            socket.end();
        }
    })
}

let hostname = function (buf) {
    let hostName = '';
    if (buf.length === 4) {
        for (let i = 0; i < buf.length; i++) {
            hostName += parseInt(buf[i], 10);
            if (i !== 3)
                hostName += '.';
        }
    } else if (buf.length == 16) {
        for (let i = 0; i < 16; i += 2) {
            let part = buf.slice(i, i + 2).readUInt16BE(0).toString(16);
            hostName += part;
            if (i != 14)
                hostName += ':';
        }
    }
    return hostName;
}


const authmethods = {// only two methods of authentication are supported
    NOAUTH: 0,
    USERPASS: 2
}

//Create Socks5 listening

let socket = net.createServer(sock => {

    //Listening error
    sock.on('error', (err) => {
        console.error('error code %s', err.code);
        console.error(err);
    });

    sock.on('close', () => {
        sock.destroyed || sock.destroy();
    });

    sock.once('data ', autherHandler.bind(sock)); // processing authentication method
});


/**
 *Verify whether the domain name is legal
 */
let domainVerify = function (host) {
    let regex = new RegExp(/^([a-zA-Z0-9|\-|_]+\.)?[a-zA-Z0-9|\-|_]+\.[a-zA-Z0-9|\-|_]+(\.[a-zA-Z0-9|\-|_]+)*$/);
    return regex.test(host);
}


socket.listen(8888, () => console.log('socks5 proxy running ...')).on('error', err => console.error(err));