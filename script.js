const canvas = document.getElementById("audioCanvas");
const ctx = canvas.getContext("2d");

const audio = new Audio();
const bgVideo = document.getElementById("bgVideo");

const audioInput = document.getElementById("audioFile");
const videoBgInput = document.getElementById("videoBgFile");

// Butoane Audio
const btnPlayAudio = document.getElementById("btnPlayAudio");
const playAudioIcon = btnPlayAudio.querySelector("i");

const btnAudioBack = document.getElementById("btnAudioBack");
const btnAudioFwd = document.getElementById("btnAudioFwd");
const audioSpeed = document.getElementById("audioSpeed");
const audioSeek = document.getElementById("audioSeek");
const audioTime = document.getElementById("audioTime");

// Butoane Video
const btnPlayVideo = document.getElementById("btnPlayVideo");
const playVideoIcon = btnPlayVideo.querySelector("i");

const btnVideoBack = document.getElementById("btnVideoBack");
const btnVideoFwd = document.getElementById("btnVideoFwd");
const videoSpeed = document.getElementById("videoSpeed");
const videoSeek = document.getElementById("videoSeek");
const videoTime = document.getElementById("videoTime");

// Color
const barHue = document.getElementById("barHue");
const barHueValue = document.getElementById("barHueValue");
const rgbWaveToggle = document.getElementById("rgbWaveToggle");

let baseHue = 200;          
let rgbWaveEnabled = false; 
let wavePhase = 0;          

// Analiza Audio
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let bufferLength = 0;
let dataArray = null;

let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let audioSeeking = false;
let videoSeeking = false;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function formatTime(sec) {
  if (!Number.isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// Input
function initAudioAnalysis() {
  if (audioCtx) return;

  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();

  sourceNode = audioCtx.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 512;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  analyser.smoothingTimeConstant = 0.92;

  console.log("AudioContext + Analyser created");
}

function handleAudioFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    console.log("Not an audio file!");
    return;
  }

  audio.src = URL.createObjectURL(file);
  audio.load();

  playAudioIcon.className = "bi bi-play-fill";
  audioSeek.value = 0;
  audioTime.textContent = "0:00 / 0:00";

  console.log("Selected audio:", file.name, file.type, file.size);
}

function handleVideoFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("video/")) {
    console.log("Not a video file!");
    return;
  }

  bgVideo.src = URL.createObjectURL(file);
  bgVideo.load();
  bgVideo.play();

  playVideoIcon.className = "bi bi-pause-fill";
  videoSeek.value = 0;
  videoTime.textContent = "0:00 / 0:00";

  console.log("Selected video:", file.name, file.type, file.size);
}

// Audio
btnPlayAudio.addEventListener("click", async () => {
  if (!audio.src) {
    console.log("No audio loaded");
    return;
  }

  initAudioAnalysis();

  if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();

  if (audio.paused) {
    audio.play();
    playAudioIcon.className = "bi bi-pause-fill";
  } else {
    audio.pause();
    playAudioIcon.className = "bi bi-play-fill";
  }
});

btnAudioBack.addEventListener("click", () => {
  if (!audio.src) return;
  audio.currentTime = clamp(audio.currentTime - 5, 0, Number.POSITIVE_INFINITY);
});

btnAudioFwd.addEventListener("click", () => {
  if (!audio.src || !Number.isFinite(audio.duration)) return;
  audio.currentTime = clamp(audio.currentTime + 5, 0, audio.duration);
});

audioSpeed.addEventListener("change", () => {
  audio.playbackRate = Number(audioSpeed.value);
});

audioSeek.addEventListener("input", () => {
  audioSeeking = true;
});

audioSeek.addEventListener("change", () => {
  if (!audio.src || !Number.isFinite(audio.duration)) {
    audioSeeking = false;
    return;
  }
  const t = (audioSeek.value / 1000) * audio.duration;
  audio.currentTime = clamp(t, 0, audio.duration);
  audioSeeking = false;
});

audio.addEventListener("timeupdate", () => {
  if (!audio.src) return;

  if (Number.isFinite(audio.duration)) {
    if (!audioSeeking) {
      audioSeek.value = Math.floor((audio.currentTime / audio.duration) * 1000);
    }
    audioTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }
});

audio.addEventListener("ended", () => {
  playAudioIcon.className = "bi bi-play-fill";
});

// Video
btnPlayVideo.addEventListener("click", () => {
  if (!bgVideo.src) {
    console.log("No background video loaded");
    return;
  }

  if (bgVideo.paused) {
    bgVideo.play();
    playVideoIcon.className = "bi bi-pause-fill";
  } else {
    bgVideo.pause();
    playVideoIcon.className = "bi bi-play-fill";
  }
});

btnVideoBack.addEventListener("click", () => {
  if (!bgVideo.src) return;
  bgVideo.currentTime = clamp(bgVideo.currentTime - 5, 0, Number.POSITIVE_INFINITY);
});

btnVideoFwd.addEventListener("click", () => {
  if (!bgVideo.src || !Number.isFinite(bgVideo.duration)) return;
  bgVideo.currentTime = clamp(bgVideo.currentTime + 5, 0, bgVideo.duration);
});

videoSpeed.addEventListener("change", () => {
  bgVideo.playbackRate = Number(videoSpeed.value);
});

videoSeek.addEventListener("input", () => {
  videoSeeking = true;
});

videoSeek.addEventListener("change", () => {
  if (!bgVideo.src || !Number.isFinite(bgVideo.duration)) {
    videoSeeking = false;
    return;
  }
  const t = (videoSeek.value / 1000) * bgVideo.duration;
  bgVideo.currentTime = clamp(t, 0, bgVideo.duration);
  videoSeeking = false;
});

bgVideo.addEventListener("timeupdate", () => {
  if (!bgVideo.src) return;

  if (Number.isFinite(bgVideo.duration)) {
    if (!videoSeeking) {
      videoSeek.value = Math.floor((bgVideo.currentTime / bgVideo.duration) * 1000);
    }
    videoTime.textContent = `${formatTime(bgVideo.currentTime)} / ${formatTime(bgVideo.duration)}`;
  }
});

bgVideo.addEventListener("ended", () => {
  playVideoIcon.className = "bi bi-play-fill";
});

audioInput.addEventListener("change", handleAudioFileChange);
videoBgInput.addEventListener("change", handleVideoFileChange);

// Color
if (barHue && barHueValue) {
  baseHue = Number(barHue.value) || 0;
  barHueValue.textContent = String(baseHue);

  barHue.addEventListener("input", () => {
    baseHue = Number(barHue.value) || 0;
    barHueValue.textContent = String(baseHue);
  });
}

if (rgbWaveToggle && barHue) {
  rgbWaveToggle.addEventListener("change", () => {
    rgbWaveEnabled = rgbWaveToggle.checked;

    barHue.disabled = rgbWaveEnabled;
  });
}

// Visualizer
function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (bgVideo.src && bgVideo.readyState >= 2) {
    ctx.drawImage(bgVideo, 0, 0, canvasWidth, canvasHeight);
  }

  if (analyser) {
    analyser.getByteFrequencyData(dataArray);

    const barCount = 180;
    const maxBin = Math.floor(bufferLength * 0.75);
    const step = Math.max(1, Math.floor(maxBin / barCount));

    const halfWidth = canvasWidth / 2;
    const barSlot = halfWidth / barCount;  
    const gap = 0;

    const gamma = 0.6;

    let barIndex = 0;

    if (rgbWaveEnabled) wavePhase = (wavePhase + 1.2) % 360;

    for (let bin = 0; bin < maxBin; bin += step) {
      const value = dataArray[bin];
      const normalized = value / 850;
      const compressed = Math.pow(normalized, gamma);

      const barHeight = compressed * canvasHeight;
      const y = canvasHeight - barHeight;

      const pos = barIndex / Math.max(1, (barCount - 1));

      const xLeft = barIndex * barSlot;
      const xRight = canvasWidth - (barIndex + 1) * barSlot;
      const w = Math.max(1, barSlot - gap);

      const hue = rgbWaveEnabled
        ? (wavePhase + pos * 360) % 360
        : baseHue;

      const light = 30 + compressed * 55;
      ctx.fillStyle = `hsl(${hue}, 100%, ${light}%)`;

      ctx.fillRect(xLeft, y, w, barHeight);
      ctx.fillRect(xRight, y, w, barHeight);

      barIndex++;
      if (barIndex >= barCount) break;
    }
  }


  requestAnimationFrame(draw);
}

draw();
