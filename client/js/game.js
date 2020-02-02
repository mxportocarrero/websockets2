
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial"

const socket = io()

socket.on("server:playersNewPositions", data => {
  ctx.clearRect(0,0,500,500)
  data.forEach(player => {
    ctx.fillText(player.number, player.x, player.y)
  })
})