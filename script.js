const WIDTH = 300;
const HEIGHT = 300;
const CELLSIZE = 25;
const COLUMNS = WIDTH / CELLSIZE;
const ROWS = HEIGHT / CELLSIZE;

const cartesianCanvas = document.querySelector('#cartesian-canvas');
cartesianCanvas.width = WIDTH;
cartesianCanvas.height = HEIGHT;
const ctx1 = cartesianCanvas.getContext('2d');

const isometricCanvas = document.querySelector('#isometric-canvas');
isometricCanvas.width = WIDTH;
isometricCanvas.height = HEIGHT;
const ctx2 = isometricCanvas.getContext('2d');

const blueTile = new Image();
blueTile.src = 'Water1.png';
const orangeTile = new Image();
orangeTile.src = 'Lava1.png';

// game logic
const gameBoard = new Array((WIDTH / CELLSIZE) * (HEIGHT / CELLSIZE)).fill(0);
const snake = [Math.floor(Math.random() * gameBoard.length) + 1];
let direction = [0, 0];

function drawGrid(ctx) {
  ctx.strokeStyle = 'red';
  gameBoard.forEach((cell, index) => {
    [x, y] = idxToXy(index);
    drawCell(x, y, CELLSIZE, ctx);
  });
}

function drawIsometricGrid() {
  ctx2.strokeStyle = 'blue';
  gameBoard.forEach((cell, index) => {
    [x, y] = idxToXy(index);
    let xOffset = CELLSIZE/2;
    ctx2.beginPath();
    // move to the origin
    ctx2.moveTo(x * CELLSIZE + xOffset, y * CELLSIZE);
    // line to the right
    ctx2.lineTo(x * CELLSIZE + CELLSIZE/2 + xOffset, y * CELLSIZE + CELLSIZE * 0.25);
    // line down
    ctx2.lineTo(x * CELLSIZE + xOffset, y * CELLSIZE + CELLSIZE/2);
    // line to the left
    ctx2.lineTo(x * CELLSIZE - CELLSIZE/2 + xOffset, y * CELLSIZE + CELLSIZE * 0.25);
    // line up
    ctx2.lineTo(x * CELLSIZE + xOffset, y * CELLSIZE);
    ctx2.stroke();
  });
}

function drawIsometricSprite() {
  gameBoard.forEach((cell, index) => {
    [x, y] = idxToXy(index);
    [x,y] = toIsometric2(x,y);
    // if the index corresponds to a snake part, draw the snake part instead
    if (snake.includes(index)) {
      ctx2.drawImage(orangeTile,0,0,256,512,x,y,CELLSIZE,CELLSIZE*2);
    } else {
      ctx2.drawImage(blueTile,0,0,256,512,x,y,CELLSIZE,CELLSIZE*2);
    }
    
  });
}

function drawIsometricSnake() {
  snake.forEach(part => {
    [x, y] = idxToXy(part);
    [x,y] = toIsometric2(x,y);
    ctx2.drawImage(orangeTile,0,0,256,512,x,y,CELLSIZE,CELLSIZE*2);
  });
}

function drawCell(x, y, cellsize, ctx) {
  ctx.beginPath();
  // move to the origin
  ctx.moveTo(x * cellsize, y * cellsize);
  // line to the right
  ctx.lineTo(x * cellsize + cellsize, y * cellsize);
  // line down
  ctx.lineTo(x * cellsize + cellsize, y * cellsize + cellsize);
  // line to the left
  ctx.lineTo(x * cellsize, y * cellsize + cellsize);
  // line up
  ctx.lineTo(x * cellsize, y * cellsize);
  ctx.stroke();
}

function updateSnake() {
  let oldTail = snake.pop();
  [x, y] = idxToXy(oldTail);
  let newX = x + direction[0];
  let newY = y + direction[1];
  let horizontalMove =
    Math.abs(direction[0]) > Math.abs(direction[1]) ? true : false;
  if (horizontalMove) {
    if (newX >= COLUMNS) {
      newX = 0;
      newY++;
    }
    if (newX < 0) {
      newX = COLUMNS - 1;
      newY--;
    }
    if (newY >= ROWS) {
      newY = 0;
    }
    if (newY < 0) {
      newY = ROWS - 1;
    }
  } else {
    if (newY >= ROWS) {
      newY = 0;
      newX++;
    }
    if (newY < 0) {
      newY = ROWS - 1;
      newX--;
    }
    if (newX >= COLUMNS) {
      newX = 0;
    }
    if (newX < 0) {
      newX = COLUMNS - 1;
    }
  }
  let newPos = xyToIdx(newX, newY);
  snake.unshift(newPos);
}

function setDirection(e) {
  switch (e.key) {
    case 'ArrowUp':
      direction = [0, -1];
      break;
    case 'ArrowDown':
      direction = [0, 1];
      break;
    case 'ArrowLeft':
      direction = [-1, 0];
      break;
    case 'ArrowRight':
      direction = [1, 0];
      break;
  }
}

// utils
function idxToXy(idx) {
  const x = Math.floor(idx / ROWS);
  const y = idx % COLUMNS;
  return [x, y];
}

function xyToIdx(x, y) {
  return x * ROWS + y;
}

function toIsometric(x, y) {
  let isoX = x * 1 + y * -1;
  let isoY = x * 0.5 + y * 0.5;
  return [isoX, isoY];
}

function toIsometric2(x, y) {
  let isoX = x * 0.5*CELLSIZE + y * -0.5*CELLSIZE;
  let isoY = x * 0.25*CELLSIZE + y * 0.25*CELLSIZE;
  // offsets to center the isometric plane on the canvas
  let xOffset = CELLSIZE/2;
  let canvasOffset = WIDTH/2
  isoX = isoX-xOffset+canvasOffset;
  return [isoX, isoY];
}

// set custom fps to slow animation down
let now, then, elapsed, fpsInterval;
function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  tick();
}

// render loop
function tick() {
  requestAnimationFrame(tick);

  // debounce
  now = Date.now();
  elapsed = now - then;

  if (elapsed < fpsInterval) {
    return;
  }
  then = now;
  // end debounce

  ctx1.clearRect(0, 0, WIDTH, HEIGHT);
  ctx2.clearRect(0, 0, WIDTH, HEIGHT);

  // draw the background;
  ctx1.fillStyle = 'black';
  ctx1.fillRect(0, 0, WIDTH, HEIGHT);
  ctx2.fillStyle = 'grey';
  ctx2.fillRect(0, 0, WIDTH, HEIGHT);

  drawGrid(ctx1);
  drawGrid(ctx2);
  drawIsometricGrid();
  drawIsometricSprite();

  // update snake position
  updateSnake();
  // draw the snake
  ctx1.fillStyle = 'red';
  snake.forEach(part => {
    [x, y] = idxToXy(part);
    ctx1.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE);
  });
  //drawIsometricSnake();
}

window.addEventListener('keydown', setDirection);

startAnimating(5);
