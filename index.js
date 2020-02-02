import dotenv from 'dotenv';
dotenv.config();

import {Server} from 'http';
import express from 'express';
import path from 'path';
import SocketIO from 'socket.io'
const app = express();

const server = new  Server(app)

// static files
app.use('/client', express.static(path.join(__dirname,'client')));

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/client/index.html');
})

server.listen(process.env.PORT || 3001);
console.log("Server started")


// sockets
const socketList = []
const io = SocketIO(server)

io.sockets.on('connection', (socket => {
  // socket configuration
  socket.id = parseInt((Math.random()*1000000), 10);
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10 * Math.random())
  console.log("socket connection with id", socket.id)
  socketList[socket.id] = socket

  socket.on('disconnect', () => {
    delete socketList[socket.id]
  })

}));

setInterval(() => {
  const playerPositions = []
  socketList.forEach(socket => {
    socket.x++;
    socket.y++;
    playerPositions.push({
      x:socket.x,
      y:socket.y,
      number: socket.number
    })
  })

  socketList.forEach(socket => {
    socket.emit('server:playersNewPositions', playerPositions);
  })
}, 1000/20);
