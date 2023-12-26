const shapeSelector = document.getElementById('shape-selector');
const colorPicker = document.getElementById('color-picker');
const sizeSlider = document.getElementById('size-slider');

const canvas = document.querySelector('#canvas_1');
const ctx = canvas.getContext('2d');

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

document.getElementById('save-btn').addEventListener('click', function() {
    const imageDataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download  = '';
    link.click();
});

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

document.getElementById('save-btn').addEventListener('click', function() {
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
});
document.getElementById('shape-selector').addEventListener('change', function(event) {
    isEraser = event.target.value === 'eraser';
});


let shapes = [];
let drawings = [];

let lastX = null;
let lastY = null;

const mouse = {
    x:undefined,
    y:undefined,
    isPressed: false
}
window.addEventListener('resize', function () {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    shapes.forEach(shape => drawShapeWithProperties(shape));
    ctx.drawImage(offscreenCanvas, 0, 0);
});

canvas.addEventListener('pointerdown', function(event) {
    mouse.isPressed = true;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    drawShape();
    lastX = event.clientX;
    lastY = event.clientY;
});
canvas.addEventListener('pointerup', function(event) {
    mouse.isPressed = false;
    lastX = null;
    lastY = null;
});
canvas.addEventListener('pointermove', function(event) {
    if (!mouse.isPressed) return;
    mouse.x = event.x;
    mouse.y = event.y;

    if (lastX !== null && lastY !== null) {
        drawLine(lastX, lastY, mouse.x, mouse.y);
    }
    lastX = mouse.x;
    lastY = mouse.y;
});

function drawLine(x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const steps = distance * 2; // Ajustez pour plus ou moins de densité

    for (let i = 0; i < steps; i++) {
        const x = x1 + (x2 - x1) * i / steps;
        const y = y1 + (y2 - y1) * i / steps;

        drawShapeWithProperties({
            type: shapeSelector.value,
            x: x,
            y: y,
            size: parseInt(sizeSlider.value),
            color: colorPicker.value
        });
    }
}

function drawShape() {
    if (!mouse.isPressed) return;

    let shapeDetails = {
        type: shapeSelector.value,
        x: mouse.x,
        y: mouse.y,
        size: parseInt(sizeSlider.value),
        color: colorPicker.value
    };
    shapes.push(shapeDetails);

    drawShapeWithProperties(shapeDetails);

}
function drawShapeWithProperties(shape) {
    ctx.fillStyle = shape.color;
    if (shape.type === 'eraser') {
        let eraserSize = shape.size;
        ctx.clearRect(shape.x - eraserSize / 2, shape.y - eraserSize / 2, eraserSize, eraserSize);
    } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape.type === 'rectangle') {
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    }
    ctx.drawImage(canvas, 0, 0);
}
