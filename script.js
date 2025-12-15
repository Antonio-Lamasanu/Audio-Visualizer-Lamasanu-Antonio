const canvas = document.getElementById('audioCanvas');

const ctx = canvas.getContext('2d');

const audio = new Audio();

const playBtn = document.getElementById("btnPlay");
const playIcon = playBtn.querySelector("i");

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let bufferLength = 0;
let dataArray = null;

const audioInput = document.getElementById("audioFile");
audioInput.addEventListener("change", handleAudioFileChange);

let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

playBtn.addEventListener("click", () => {
    if (!audio.src) {
        console.log("No audio loaded");
        return;
    }

    initAudioAnalysis();

    if (audio.paused)
    {
        playIcon.className = "bi bi-pause-fill";
        audio.play();
    }
    else
    {
        playIcon.className = "bi bi-play-fill";
        audio.pause();
    }
});

function initAudioAnalysis()
{
    if (audioCtx) return;

    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();

    console.log("AudioContext + Analyser created");

    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 512;

    bufferLength = analyser.frequencyBinCount;

    dataArray = new Uint8Array(bufferLength);
}

function handleAudioFileChange(e)
{
    console.log("Input audio detected");
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/"))
    {
        console.log("Not an audio file!");
        return;
    }
    console.log("Selected file: ", file.name, file.type, file.size);
    
    audio.src = URL.createObjectURL(file);
    audio.load();
    
}

function draw()
{
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "rgba(222, 30, 30, 0.73)";

    if (analyser){
        analyser.getByteFrequencyData(dataArray);
        
        const barWidth = canvasWidth / bufferLength;

        for (let i = 0; i < bufferLength; i++) {
            
            const barHeight = (dataArray[i] / 255) * canvasHeight;

            const x = i * barWidth;
            const y = canvasHeight - barHeight;

            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }
    requestAnimationFrame(draw);
}

draw();
