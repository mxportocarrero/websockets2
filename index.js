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
const socketList = {} // must be an object because it behaves like a hash
const playerList = {}
const io = SocketIO(server)

const Player = (id) => {
  const self = {
    x:250,
    y:250,
    id,
    number: "" + Math.floor(10 * Math.random()),
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpeed: 10,
  }

  self.updatePosition = () => {
    if(self.pressingRight)
      self.x += self.maxSpeed
    if(self.pressingLeft)
      self.x -= self.maxSpeed
    if(self.pressingUp)
      self.y -= self.maxSpeed
    if(self.pressingDown)
      self.y += self.maxSpeed

  }
  return self
}

io.sockets.on('connection', (socket => {
  // socket configuration
  socket.id = parseInt((Math.random()*1000000), 10);
  console.log("socket connection with id", socket.id)
  const player = Player(socket.id)
  playerList[socket.id] = player
  socketList[socket.id] = socket

  socket.on('disconnect', () => {
    delete socketList[socket.id]
    delete playerList[socket.id]
  })

  socket.on('keypress', data => {
    if(data.inputID === 'left')
      player.pressingLeft = data.state
    else if(data.inputID === 'right')
      player.pressingRight = data.state
    else if(data.inputID === 'up')
      player.pressingUp = data.state
    else if(data.inputID === 'down')
      player.pressingDown = data.state
    })

}));

setInterval(() => {
  const playerPositions = Object.keys(playerList).map(key =>{
    const player = playerList[key]
    player.updatePosition()
    return player
  })

  Object.keys(socketList).forEach(key => {
    const socket = socketList[key]
    socket.emit('server:playersNewPositions', playerPositions);
  })
}, 1000/25);
