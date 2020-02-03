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

const Entity = () => {
  const self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id:"",
  }

  self.update = () => {
    //console.log("entity update")
    self.updatePosition()
  }

  self.updatePosition = () => {
    self.x += self.spdX;
    self.y += self.spdY;
  }

  self.getDistance = (pt) => {
    return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2))
  }

  return self
}

const Player = (id) => {
  const self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.maxSpeed = 10;

  const super_update = self.update

  self.update = () => {
    //console.log("player update")

    self.updateSpd();
    super_update();

    if(self.pressingAttack){
      for(let i = -3; i < 3; i++)
        // self.shootBullet(Math.random()*360)
        self.shootBullet(i * 10 + self.mouseAngle)
    }
  }

  self.shootBullet = (angle) => {
    const b = Bullet(self.id, angle);
      b.x = self.x;
      b.y = self.y;
  }

  self.updateSpd = () => {
    if(self.pressingRight)
      self.spdX = self.maxSpeed;
    else if(self.pressingLeft)
      self.spdX = -self.maxSpeed;
    else self.spdX = 0;

    if(self.pressingUp)
      self.spdY = -self.maxSpeed;
    else if(self.pressingDown)
      self.spdY = self.maxSpeed;
    else self.spdY = 0;
  }

  Player.list[id] = self;
  return self
} // Eof Player definition

const Bullet = (parent, angle) => {
  const self = Entity()
  self.id = Math.random()
  self.spdX = Math.cos(angle/180*Math.PI) * 10
  self.spdY = Math.sin(angle/180*Math.PI) * 10
  self.parent = parent
  self.timer = 0;
  self.toRemove = false;
  const super_update = self.update;
  self.update = () => {
    if(self.timer++ > 100)
      self.toRemove = true;
    super_update();

    Object.keys(Player.list).forEach(key => {
      const player = Player.list[key]
      if(self.getDistance(player) < 32 && self.parent !== player.id){
        // TODO handle collision
        self.toRemove = true
      }
    })
  }

  Bullet.list[self.id] = self;
  return self;

} // Eof Bullet definition

Bullet.list = {}

Bullet.update = () => {
  return Object.keys(Bullet.list).filter(key => {
    const bullet = Bullet.list[key]
    if(bullet.toRemove){
      delete Bullet.list[key]
      return false
    }
    return true
  }).map(key =>{
    const bullet = Bullet.list[key]
    bullet.update()
    return bullet
  })
}

Player.list = {}
Player.onConnect = socket => {
  const player = Player(socket.id)
  
  socket.on('keyPress', data => {
    //console.log(data)
    if(data.inputID === 'left')
      player.pressingLeft = data.state
    else if(data.inputID === 'right')
      player.pressingRight = data.state
    else if(data.inputID === 'up')
      player.pressingUp = data.state
    else if(data.inputID === 'down')
      player.pressingDown = data.state
    else if(data.inputID === 'attack')
      player.pressingAttack = data.state
    else if(data.inputID === 'mouseAngle')
      player.mouseAngle = data.state
    })
}

Player.onDisconnect = socket => {
  delete Player.list[socket.id];
}

Player.update = () => {
  return Object.keys(Player.list).map(key =>{
    const player = Player.list[key]
    player.update()
    return player
  })
}

const DEBUG = true;

io.sockets.on('connection', (socket => {
  // socket configuration
  socket.id = parseInt((Math.random()*1000000), 10);
  console.log("socket connection with id", socket.id)
  socketList[socket.id] = socket

  Player.onConnect(socket)

  socket.on('disconnect', () => {
    delete socketList[socket.id]
    Player.onDisconnect(socket)
  })

  socket.on('sendingMessageToServer', data => {
    //console.log(data)
    const playerName = ("" + socket.id).slice(2,7);

    Object.keys(socketList).forEach(key => {
      const socket = socketList[key]
      socket.emit('server:addToChat', `${playerName}: ${data}`);
    })
  })

  socket.on('evalServer', data => {
    if(!DEBUG) return;
    const res = eval(data)
    socket.emit('server:evalAnswer', res)
  })

}));

setInterval(() => {
  const positions = {
    players: Player.update(),
    bullets: Bullet.update()
  }

  Object.keys(socketList).forEach(key => {
    const socket = socketList[key]
    socket.emit('server:newPositions', positions);
  })
}, 1000/25);
