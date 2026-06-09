const canvas = document.getElementById("pendulum-canvas");
const addButton = document.getElementById("pendulum-add");
const textToggle = document.getElementById("text-toggle");
const equationCell = document.querySelector(".equation-cell");
const context = canvas.getContext("2d");

const colors = [
  "#63213a",
  "#88402e",
  "#9d6d3a",
  "#9ea89e",
  "#7fb5c3",
  "#4f87b6",
  "#5941a0",
  "#38204f",
];

const trailLifetime = 10_000;
const massDiameter = 10;
const massRadius = massDiameter / 2;
const pendulums = [];
let lastFrameTime = performance.now();
let deviceScale = 1;

function resizeCanvas() {
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * deviceScale);
  canvas.height = Math.floor(window.innerHeight * deviceScale);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function colorForIndex(index) {
  if (index < colors.length) {
    return colors[index];
  }

  const hue = Math.round((index * 137.508) % 360);
  return `hsl(${hue} 18% 46%)`;
}

function createPendulum(index) {
  const viewportMin = Math.min(window.innerWidth, window.innerHeight);
  return {
    color: colorForIndex(index),
    lengthOne: randomBetween(viewportMin * 0.08, viewportMin * 0.14),
    lengthTwo: randomBetween(viewportMin * 0.08, viewportMin * 0.15),
    massOne: randomBetween(0.8, 1.4),
    massTwo: randomBetween(0.8, 1.4),
    thetaOne: randomBetween(Math.PI * 0.65, Math.PI * 1.35),
    thetaTwo: randomBetween(Math.PI * 0.65, Math.PI * 1.35),
    omegaOne: randomBetween(-0.35, 0.35),
    omegaTwo: randomBetween(-0.35, 0.35),
    trail: [],
  };
}

function getOrigin() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function getEndPoint(pendulum) {
  const origin = getOrigin();
  const xOne = origin.x + pendulum.lengthOne * Math.sin(pendulum.thetaOne);
  const yOne = origin.y + pendulum.lengthOne * Math.cos(pendulum.thetaOne);

  return {
    x: xOne + pendulum.lengthTwo * Math.sin(pendulum.thetaTwo),
    y: yOne + pendulum.lengthTwo * Math.cos(pendulum.thetaTwo),
  };
}

function stepPendulum(pendulum, deltaTime) {
  const {
    lengthOne,
    lengthTwo,
    massOne,
    massTwo,
    thetaOne,
    thetaTwo,
    omegaOne,
    omegaTwo,
  } = pendulum;

  const thetaDelta = thetaOne - thetaTwo;
  const denominatorOne =
    lengthOne * (2 * massOne + massTwo - massTwo * Math.cos(2 * thetaDelta));
  const denominatorTwo =
    lengthTwo * (2 * massOne + massTwo - massTwo * Math.cos(2 * thetaDelta));

  const alphaOne =
    (-2 * Math.sin(thetaDelta) * massTwo *
        (omegaTwo * omegaTwo * lengthTwo + omegaOne * omegaOne * lengthOne * Math.cos(thetaDelta))) /
    denominatorOne;

  const alphaTwo =
    (2 * Math.sin(thetaDelta) *
      (omegaOne * omegaOne * lengthOne * (massOne + massTwo) +
        omegaTwo * omegaTwo * lengthTwo * massTwo * Math.cos(thetaDelta))) /
    denominatorTwo;

  pendulum.omegaOne += alphaOne * deltaTime;
  pendulum.omegaTwo += alphaTwo * deltaTime;
  pendulum.thetaOne += pendulum.omegaOne * deltaTime;
  pendulum.thetaTwo += pendulum.omegaTwo * deltaTime;
}

function drawTrail(pendulum, now) {
  const points = pendulum.trail;
  if (points.length < 2) {
    return;
  }

  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = massDiameter;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const age = now - current.time;
    const opacity = Math.max(0, 1 - age / trailLifetime);

    context.globalAlpha = opacity * 0.28;
    context.strokeStyle = pendulum.color;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(current.x, current.y);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawMass(pendulum) {
  const point = getEndPoint(pendulum);
  context.beginPath();
  context.arc(point.x, point.y, massRadius, 0, Math.PI * 2);
  context.fillStyle = pendulum.color;
  context.shadowColor = pendulum.color;
  context.shadowBlur = 10;
  context.globalAlpha = 0.72;
  context.fill();
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function animate(now) {
  const elapsed = Math.min((now - lastFrameTime) / 1000, 0.05);
  const substeps = 4;
  const stepTime = elapsed / substeps;
  lastFrameTime = now;

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const pendulum of pendulums) {
    for (let step = 0; step < substeps; step += 1) {
      stepPendulum(pendulum, stepTime);
    }

    const point = getEndPoint(pendulum);
    pendulum.trail.push({ ...point, time: now });
    pendulum.trail = pendulum.trail.filter((trailPoint) => now - trailPoint.time <= trailLifetime);

    drawTrail(pendulum, now);
    drawMass(pendulum);
  }

  requestAnimationFrame(animate);
}

function addPendulum() {
  pendulums.push(createPendulum(pendulums.length));
}

function toggleWebsiteText() {
  const isHidden = document.body.classList.toggle("text-hidden");
  textToggle.setAttribute("aria-pressed", String(isHidden));
  textToggle.setAttribute("aria-label", isHidden ? "Show website text" : "Hide website text");
  equationCell.setAttribute("aria-hidden", String(!isHidden));
}

resizeCanvas();
addPendulum();
requestAnimationFrame((now) => {
  lastFrameTime = now;
  animate(now);
});

addButton.addEventListener("click", addPendulum);
textToggle.addEventListener("click", toggleWebsiteText);
window.addEventListener("resize", resizeCanvas);
