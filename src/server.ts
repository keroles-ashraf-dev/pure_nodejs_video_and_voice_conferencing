import * as http from 'http';
import * as url from 'url';
import * as socketIO from 'socket.io';
import * as constant from './util/constant';
import * as file from './util/file';
import { log } from './util/debug';

// handle requests
async function handler(req: http.IncomingMessage, res: http.ServerResponse) {

    const parsedUrl = url.parse(req.url!, true);

    if (parsedUrl.pathname === '/') {

        const view = await file.get(constant.VIEW_PATH + 'index.html',);

        res.setHeader('Content-Type', 'text/html');
        res.end(view);

    } else if (parsedUrl.pathname?.includes('/public/asset')) {

        const view = await file.get(constant.ASSET_PATH + 'index.js',);

        res.setHeader('Content-Type', 'application/javascript');
        res.end(view);

    } else {
        res.writeHead(404, { 'Content-type': 'text/plain' });
        res.write('404 Not Found');
        res.end();
    };
}

// create server
const httpServer = http.createServer(handler);

// create socket server
const socketServer = new socketIO.Server(httpServer);

// store connected sockets
let sockets: string[] = [];

// handle socket connection
socketServer.on('connection', (socket) => {
    log('socketServer - connection: ' + socket.id);

    const existingSocket = sockets.find(s => s === socket.id);

    if (!existingSocket) sockets.push(socket.id);

    log('connection - connectedSockets: ' + sockets);

    if (sockets.length > 1) {

        // notify current clients about new client join request
        socket.broadcast.emit('ON_JOIN_REQUEST', {
            socket_id: socket.id,
        });
    }

    // notify target client about offer created for him
    socket.on("ON_OFFER_CREATED", data => {
        log('ON_OFFER_CREATED');

        socket.to(data.socket_id).emit('ON_OFFER_CREATED', {
            socket_id: socket.id,
            offer: data.offer,
        });
    });

    // notify target client about answer created on his offer
    socket.on("ON_ANSWER_CREATED", data => {
        log('ON_ANSWER_CREATED');

        socket.to(data.socket_id).emit('ON_ANSWER_CREATED', {
            socket_id: socket.id,
            answer: data.answer,
        });
    });

    // notify target client about candidate created on his offer
    socket.on("ON_OFFER_CANDIDATE", data => {
        log('ON_OFFER_CANDIDATE');

        socket.to(data.socket_id).emit('ON_OFFER_CANDIDATE', {
            socket_id: socket.id,
            candidate: data.candidate,
        });
    });

    // notify target client about candidate created on his answer
    socket.on("ON_ANSWER_CANDIDATE", data => {
        log('ON_ANSWER_CANDIDATE');

        socket.to(data.socket_id).emit('ON_ANSWER_CANDIDATE', {
            socket_id: socket.id,
            candidate: data.candidate,
        });
    });

    // notify all clients about disconnected client
    socket.on("disconnect", () => {
        log('disconnect');

        // remove disconnected socket from connected sockets
        sockets = sockets.filter(s => s !== socket.id);

        log('disconnect - connectedSockets: ' + sockets);

        // notify all clients about disconnected client
        socket.broadcast.emit("ON_DISCONNECTED", {
            socket_id: socket.id,
        });
    });
});

// start server
httpServer.listen(3000, () => 'server started');
