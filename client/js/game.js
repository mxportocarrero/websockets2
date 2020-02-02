
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"

const socket = io()

socket.on("server:playersNewPositions", data => {
  ctx.clearRect(0,0,500,500)
  data.forEach(player => {
    ctx.fillText(player.number, player.x, player.y)
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