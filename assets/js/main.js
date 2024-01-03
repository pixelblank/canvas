const colorPicker = document.getElementById('color-picker');
const sizeSlider = document.getElementById('size-slider');
const canvas = document.querySelector('#canvas_1');
const ctx = canvas.getContext('2d');
let currentTool = 'brush';
let shapes = [];
let lastX = null;
let lastY = null;
const mouse = { x: undefined, y: undefined, isPressed: false };

// Configuration initiale du canvas
function setupCanvas() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}
setupCanvas();

// Gestion des événements
function setupEventListeners() {
    // Événements UI
    document.querySelector('.nav_door').addEventListener('click', toggleNav);
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleToolChange);
    });
    document.querySelector('#save-btn').addEventListener('click', saveDocument);

    // Événements de dessin
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointermove', draw);
    window.addEventListener('resize', handleResize);
}

// Handlers
function toggleNav() {
    document.querySelector('nav').classList.toggle('open');
    document.querySelector('.layout').classList.toggle('open');
}
function saveDocument(){
    const fileName = document.getElementById('file-name').value || 'dessin';
    const format = document.getElementById('file-format').value;
    let imageDataURL;
    if (format === 'png') {
        imageDataURL = canvas.toDataURL('image/png');
    } else if (format === 'jpeg') {
        imageDataURL = canvas.toDataURL('image/jpeg');
    }
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = fileName + '.' + format;
    link.click();
}

function handleToolChange(event) {
    if(event.target.checked) {
        currentTool = event.target.value;
        console.log(currentTool)
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.nextElementSibling.classList.toggle('active', radio === event.target);
        });
    }
}

function startDrawing(event) {
    mouse.isPressed = true;
    updateMousePosition(event);
    drawShape();
}

function stopDrawing() {
    mouse.isPressed = false;
    lastX = null;
    lastY = null;
}

function draw(event) {
    if (!mouse.isPressed) return;
    updateMousePosition(event);
    if (lastX !== null && lastY !== null) {
        drawLine(lastX, lastY, mouse.x, mouse.y);
    }
    updateLastPosition();
}

function handleResize() {
    setupCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(drawShapeWithProperties);
}

// Fonctions de dessin
function updateMousePosition(event) {
    mouse.x = event.x;
    mouse.y = event.y;
}

function updateLastPosition() {
    lastX = mouse.x;
    lastY = mouse.y;
}

function drawLine(x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const steps = distance * 2;

    for (let i = 0; i < steps; i++) {
        const x = x1 + (x2 - x1) * i / steps;
        const y = y1 + (y2 - y1) * i / steps;

        const shapeDetails = {
            type: currentTool,
            x: x,
            y: y,
            size: parseInt(sizeSlider.value),
            color: (currentTool === 'brush') ? colorPicker.value : 'transparent'
        };

        shapes.push(shapeDetails);
        drawShapeWithProperties(shapeDetails);
    }
}

function drawShape() {
    if (!mouse.isPressed) return;

    let shapeDetails = {
        type: currentTool,
        x: mouse.x,
        y: mouse.y,
        size: parseInt(sizeSlider.value),
        color: colorPicker.value
    };
    shapes.push(shapeDetails);

    drawShapeWithProperties(shapeDetails);

}

function drawShapeWithProperties(shape) {
    if (currentTool === 'eraser') {
        let eraserSize = shape.size;
        ctx.clearRect(shape.x - eraserSize / 2, shape.y - eraserSize / 2, eraserSize, eraserSize);
    } else if (currentTool === 'brush') {
        ctx.fillStyle = shape.color;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentTool == "text"){
        ctx.fillText()
    }
}
setupEventListeners();
