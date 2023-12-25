const canvas = document.querySelector('#canvas_1');
const ctx = canvas.getContext('2d');



document.getElementById('save-btn').addEventListener('click', function() {
    const imageDataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download  = '';
    link.click();
});

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;


const shapeSelector = document.getElementById('shape-selector');
const colorPicker = document.getElementById('color-picker');
const sizeSlider = document.getElementById('size-slider');



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

window.addEventListener('resize', function () {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    // Effacer le contenu du canvas hors écran avant de redessiner
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Redessiner toutes les formes stockées
    shapes.forEach(shape => drawShapeWithProperties(shape));
});
const mouse = {
    x:undefined,
    y:undefined,
    isPressed: false
}

canvas.addEventListener('pointerdown', function(event) {
    mouse.isPressed = true;
    if (mouse.isPressed) {
        drawShape();
    }
});

canvas.addEventListener('pointerup', function(event) {
    mouse.isPressed = false;
});

canvas.addEventListener('pointermove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    if (mouse.isPressed) {
        drawShape();
    }
});

function drawShape() {
    if (!mouse.isPressed) return;

    let shapeDetails = {
        type: shapeSelector.value,
        x: mouse.x,
        y: mouse.y,
        size: parseInt(sizeSlider.value),
        color: colorPicker.value
    };
    shapes.push(shapeDetails); // Ajouter les détails de la forme

    drawShapeWithProperties(shapeDetails);

}
function drawShapeWithProperties(shape) {
    ctx.fillStyle = shape.color;
    if (shape.type === 'eraser') {
        // Logique pour la gomme

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
    // Ajoutez d'autres types de formes ici
}
