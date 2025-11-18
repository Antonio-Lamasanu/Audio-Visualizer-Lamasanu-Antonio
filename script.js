const canvas = document.getElementById('audioCanvas')

const ctx = canvas.getContext('2d')

let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

function draw()
{
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'rgba(222, 30, 30, 0.73)';

    ctx.fillRect(50, 50, 100, 100)
    requestAnimationFrame(draw);
}

draw();