const chatText = document.getElementById('chat-text')
const chatInput = document.getElementById('chat-input')
const chatForm = document.getElementById('chat-form')
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"

const socket = io()

// sign




// game
socket.on("server:newPositions", data => {
  ctx.clearRect(0,0,500,500)
  data.players.forEach(player => {
    ctx.fillText(player.number, player.x, player.y)
  })
  data.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x-5, bullet.y-5,10,10)
  })
})

socket.on('server:addToChat', data => {
  //console.log(data)
  chatText.innerHTML += `<div> ${data} </div>`
})

socket.on('server:evalAnswer', data => {
  console.log(data)
})

chatForm.onsubmit = e => {
  e.preventDefault();
  if(chatInput.value[0] === '/')
    socket.emit('evalServer', chatInput.value.slice(1))
  else
    socket.emit('sendingMessageToServer', chatInput.value);
  chatInput.value = "";
}

document.onkeydown = event =>{
  console.log(event.keyCode)
  if(event.keyCode === 68)
    socket.emit('keyPress', {
      inputID:'right', state: true
    })
  else if(event.keyCode === 83)
    socket.emit('keyPress', {
      inputID:'down', state: true
    })
  else if(event.keyCode === 65)
    socket.emit('keyPress', {
      inputID:'left', state: true
    })
  else if(event.keyCode === 87)
    socket.emit('keyPress', {
      inputID:'up', state: true
    })
}

document.onkeyup = event =>{
  if(event.keyCode === 68)
    socket.emit('keyPress', {
      inputID:'right', state: false
    })
  else if(event.keyCode === 83)
    socket.emit('keyPress', {
      inputID:'down', state: false
    })
  else if(event.keyCode === 65)
    socket.emit('keyPress', {
      inputID:'left', state: false
    })
  else if(event.keyCode === 87)
    socket.emit('keyPress', {
      inputID:'up', state: false
    })
}

document.onmousedown = event => {
  socket.emit('keyPress', {inputID: 'attack', state:true})
}

document.onmouseup = event => {
  socket.emit('keyPress', {inputID: 'attack', state:false})
}

document.onmousemove = event => {
  const x = -250 + event.clientX - 8;
  const y = -250 + event.clientY - 8;

  const angle = Math.atan2(y,x) / Math.PI * 180;
  socket.emit('keyPress',{inputID: 'mouseAngle', state: angle});
}