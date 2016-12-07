/**
 * Webchat using Node.js
 * - based upon https://github.com/nodecode/Node.js-Chat
 * - now in cool
 * 
 * @author Alexander Ochs, http://noxmiles.de
 * 
 * + + LICENCES + +
 * Notification Sound:
 * https://notificationsounds.com/notification-sounds/you-wouldnt-believe-510
 * Licensed under the Creative Commons Attribution license
 * 
 * Icons from www.flaticon.com
 * flash by 'freepik' http://www.flaticon.com/packs/photography-skills
 * speaker by 'Madebyoliver' http://www.flaticon.com/packs/essential-set-2
 * sun/moon by 'Vectors Market' http://www.flaticon.com/packs/weather-elements
 */

// Server in Variablen bereitstellen
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    conf = require('./config.json'),
    fs = require("fs"),
    helmet = require("helmet"),
    compression = require("compression"),
    aktiveNutzer = 0,
    connections = [],
    data = fs.readFileSync("quotes", "utf8"),
    quotefile = data.toString(),
    quotes = quotefile.split("\n");

server.listen(conf.port);

// Express konfigurieren, die Dateien aus public anzuzeigen
app.use(helmet());
app.use(helmet.noCache());
app.use(compression());
app.set("trust proxy", 1);
app.use(express.static(__dirname + '/public'));


// Gibt index.html zurück, wenn / aufgerufen wird
app.get('/', function (req, res) {
    //console.log(req.ip);
    //console.log(req.ips);
    res.sendFile(__dirname + '/public/index.html');
});





// # # #   F U N K T I O N E N   # # #

function Item(socketId, socketIp, username) {
    this.socketId = socketId;
    this.socketIp = socketIp;
    this.username = username;
}

function addIpToId(socketId, socketIp) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].socketId == socketId) {
            connections[i].socketIp = socketIp;
        }
    }
}

function addNameToId(socketId, username) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].socketId == socketId) {
            connections[i].username = username;
        }
    }
}

function deleteSocket(IdToDelete) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].socketId == IdToDelete) {
            connections.splice(i);
        }
    }
}

function getUserName(name) {
    if (name === "") {
        return "n/a";
    } else {
        return name;
    }
}

function getUserIp(ip) {
    if (ip === "") {
        return "n/a";
    } else {
        return ip;
    }
}

function getIpFromSocketId(socketId) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].socketId == socketId) {
            return connections[i].socketIp;
        }
    }
}

function listAllUserString() {
    var stringTemp = "";
    for (var i = 0; i < connections.length; i++) {
        stringTemp += getUserName(connections[i].username) + " (" + getUserIp(connections[i].socketIp) + "); ";
    }
    return aktiveNutzer + " Nutzer: " + stringTemp;
}

function timestamp() {
    function pad(n) {
        return n < 10 ? "0" + n : n;
    }
    var d = new Date();
    var dash = "-";
    var punkt = ":";
    var leer = " ";

    return d.getFullYear() + dash +
        pad(d.getMonth() + 1) + dash +
        pad(d.getDate()) + leer +
        pad(d.getHours()) + punkt +
        pad(d.getMinutes()) + punkt +
        pad(d.getSeconds());
}

function niceTimestamp() {
    var time = new Date();
    time = time.toString();
    time = time.substring(25, 39);
    return timestamp() + " " + time;
}

function quoteDay() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return quotes[day % quotes.length];
}

function quoteRandom() {
    var now = new Date();
    return quotes[now.getMilliseconds() % quotes.length];
}

function stringMaxLength(string, lengz) {
    if(string.length > lengz) {
        return string.substring(0, lengz);
    } else {
        return string;
    }
}





// # # #   S O C K E T   # # #

// Socket Konfiguration
io.sockets.on('connection', function (socket) {
    // Sobald ein Client neu per Socket verbunden ist
    connections.push(new Item(socket.id, "", ""));
    addIpToId(socket.id, (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress));
    //console.log(connections);
    var derzeitigeSocketId = socket.id;
    aktiveNutzer++;
    console.log("+ " + (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress) + " " + socket.id + " (" + aktiveNutzer + ") " + niceTimestamp());

    socket.emit('chat', {
        zeit: new Date(),
        text: "Willkommen im Node.js Chat",
        bold: true
    });
    socket.emit('chat', {
        zeit: new Date(),
        text: quoteDay()
    });
    io.sockets.emit("chat", {
        zeit: new Date(),
        text: getIpFromSocketId(socket.id) + " hat den Chat betreten (" + aktiveNutzer + ((aktiveNutzer > 1) ? " aktive Nutzer)." : " aktiver Nutzer).")
    });

    // Sobald eine Client Verbindung beendet wurde
    socket.on("disconnect", function () {
        aktiveNutzer--;
        console.log("- " + (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress) + " " + socket.id + " (" + aktiveNutzer + ") " + niceTimestamp());
        io.sockets.emit("chat", {
            zeit: new Date(),
            text: getIpFromSocketId(derzeitigeSocketId) + " hat den Chat verlassen. (" + aktiveNutzer + ((aktiveNutzer > 1) ? " aktive Nutzer)." : " aktiver Nutzer).")
        });
        deleteSocket(derzeitigeSocketId);
    });

    // Sobald der Benutzer einen Text sendet
    socket.on('chat', function (data) {
        addNameToId(socket.id, data.name);
        addIpToId(socket.id, (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress));

        // Der Text wird an alle verbundenen Sockets gesendet
        if (data.text.length > 0 && data.text != " ") {
            var realText = stringMaxLength(data.text, 1000);
            var realName = stringMaxLength(data.name, 22);

            if (data.text.search("/bold") === 0) {
                realText = realText.substring(5, realText.length);
                io.sockets.emit("chat", {
                    zeit: new Date(),
                    name: realName + " (" + (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress) + ")",
                    text: realText,
                    bold: true
                });
            } else {
                io.sockets.emit('chat', {
                    zeit: new Date(),
                    name: realName + " (" + (socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress) + ")",
                    text: realText,
                });
            }
            if (data.text == "/who") {
                console.log(connections);
                io.sockets.emit('chat', {
                    zeit: new Date(),
                    text: listAllUserString()
                });
            }
            if (data.text == "/quote") {
                io.sockets.emit("chat", {
                    zeit: new Date(),
                    text: quoteRandom()
                });
            }
        }
    });
});



console.log('Der Server läuft unter localhost:' + conf.port);