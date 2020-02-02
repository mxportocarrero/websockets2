
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"

const socket = io()

socket.on("server:newPositions", data => {
  ctx.clearRect(0,0,500,500)
  data.players.forEach(player => {
    ctx.fillText(player.number, player.x, player.y)
  })
  data.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x-5, bullet.y-5,10,10)
  })
})

document.onkeydown = event =>{
  console.log(event.keyCode)
  if(event.keyCode === 68)
    socket.emit('keypress', {
      inputID:'right', state: true
    })
  else if(event.keyCode === 83)
    socket.emit('keypress', {
      inputID:'down', state: true
    })
  else if(event.keyCode === 65)
    socket.emit('keypress', {
      inputID:'left', state: true
    })
  else if(event.keyCode === 87)
    socket.emit('keypress', {
      inputID:'up', state: true
    })
}

document.onkeyup = event =>{
  if(event.keyCode === 68)
    socket.emit('keypress', {
      inputID:'right', state: false
    })
  else if(event.keyCode === 83)
    socket.emit('keypress', {
      inputID:'down', state: false
    })
  else if(event.keyCode === 65)
    socket.emit('keypress', {
      inputID:'left', state: false
    })
  else if(event.keyCode === 87)
    socket.emit('keypress', {
      inputID:'up', state: false
    })
}