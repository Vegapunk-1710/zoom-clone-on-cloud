const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

//Reaches a room without an id and redirects to one which has an id
app.get('/', (req, res) =>{
    res.redirect(`/${uuidv4()}`);
})

//Reaches a room with a random special id
app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

//Listen to a connection using socket.io
io.on('connection', socket => {
    //When someone wants to join the room
    socket.on('join-room', (roomId, userId) => {
        //socket.io joins the room
        socket.join(roomId);
        //socket.io notify the server about the new user joining in
        socket.broadcast.to(roomId).emit('user-connected', userId);
        //socket.io listens if a message got sent to the chat
        socket.on('message', (message, name) => {
            io.to(roomId).emit('createMessage', message, name);
        })
    });
})

server.listen(3030);

