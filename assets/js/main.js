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
    canvas.addEventListener('click', eyedropper);
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

/////////////////////*element ajouté pour faire apparraitre les etiquettes des outils/////////////
document.addEventListener('DOMContentLoaded', function() {
    const radios = document.querySelectorAll('input[type="radio"]');
    const iconeBoxes = document.querySelectorAll('.icone_box');

    iconeBoxes.forEach(iconeBox => {
        let hoverTimeout;
        iconeBox.addEventListener('mouseenter', function(event) {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                const iconeTitle = this.nextElementSibling;
                if (iconeTitle) {
                    const boxRect = this.getBoundingClientRect();
                    iconeTitle.style.display = 'block';
                    iconeTitle.style.left = `${event.clientX}px`;
                    iconeTitle.style.top = `${event.clientY}px`;
                }
            }, 500);
        });
        iconeBox.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimeout);
            const iconeTitle = this.nextElementSibling;
            if (iconeTitle) {
                iconeTitle.style.display = 'none';
            }
        });
    });
});


function handleToolChange(event) {
    if(event.target.checked) {
        currentTool = event.target.value;
        updateToolSpecificProperties(currentTool);
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
function updateMousePosition(event) {
    mouse.x = event.x;
    mouse.y = event.y;
}
function updateLastPosition() {
    lastX = mouse.x;
    lastY = mouse.y;
}


function updateToolSpecificProperties(selectedTool) {
    // Masquer toutes les propriétés spécifiques aux outils
    document.querySelectorAll('.tool-specific-settings').forEach(element => {
        element.style.display = 'none';
    });

    // Afficher les propriétés spécifiques de l'outil sélectionné
    const toolSpecificProperties = document.getElementById(`${selectedTool}-properties`);
    if (toolSpecificProperties) {
        toolSpecificProperties.style.display = 'block';
    }
}
function eyedropper(){
    if (currentTool === 'eyedropper') {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        pickColor(x, y);
    }
}

function pickColor(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1);
    const data = pixel.data;
    const rgbaColor = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    setColorPicker(rgbaColor);
}

function setColorPicker(rgbaColor) {
    // Convertir RGBA en hexadécimal
    const hexColor = rgbaToHex(rgbaColor);
    document.getElementById('color-picker').value = hexColor;
}

function rgbaToHex(rgba) {
    const parts = rgba.substring(rgba.indexOf("(")).split(",");
    const r = parseInt(trim(parts[0].substring(1)), 10);
    const g = parseInt(trim(parts[1]), 10);
    const b = parseInt(trim(parts[2]), 10);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function trim(str) {
    return str.replace(/^\s+|\s+$/gm,'');
}
function drawLine(x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    const brushHardness = parseInt(document.getElementById('brush-hardness').value);

    const steps = brushHardness === 100 ? distance : distance / 20 + (distance - distance / 20) * (brushHardness / 100);
    for (let i = 0; i < steps; i++) {
        const x = x1 + (x2 - x1) * i / steps;
        const y = y1 + (y2 - y1) * i / steps;

        // Créer un dégradé pour chaque forme
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, parseInt(sizeSlider.value));

        const hardnessStop = brushHardness / 100;
        gradient.addColorStop(hardnessStop, colorPicker.value);
        gradient.addColorStop(1, colorPicker.value + '00');

        // Dessiner la forme avec le dégradé
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, parseInt(sizeSlider.value), 0, Math.PI * 2);
        ctx.fill();
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
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2, false);
        ctx.fill();
    } else {
    // Réinitialiser pour les autres outils
        ctx.globalCompositeOperation = "source-over";
        if (currentTool === 'brush') {
            const brushShape = document.getElementById('brush-shape').value;
            const brushHardness = document.getElementById('brush-hardness').value;
            const hardnessStop = brushHardness / 100;
            console.log("Brush hardness:", brushHardness); // Débogage
            console.log("Hardness stop:", hardnessStop); // Débogage
            switch (brushShape) {
                case 'circle':
                    const gradient = ctx.createRadialGradient(shape.x, shape.y, 0, shape.x, shape.y, shape.size);
                    gradient.addColorStop(hardnessStop, shape.color); // Début du dégradé basé sur la dureté
                    gradient.addColorStop(1, shape.color + '00');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'rectangle':
                    ctx.fillStyle = shape.color;
                    ctx.fillRect(shape.x, shape.y, shape.size, shape.size);
                    break;
                default:
                    ctx.fillStyle = shape.color;
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        } else if (currentTool === 'text') {
            const selectedFont = document.getElementById('font-selector').value;
            const fontWeight = document.getElementById('font-weight').value;
            const fontFS = document.getElementById('fontFS').value;
            const textValue = document.getElementById('text-value').value;
            ctx.font = `${fontWeight} ${shape.size}px ${selectedFont}`;
            if (fontFS === "fill") {
                ctx.fillStyle = shape.color;
                ctx.fillText(textValue, shape.x, shape.y);
            } else if (fontFS === 'stroke') {
                ctx.strokeStyle = shape.color;
                ctx.strokeText(textValue, shape.x, shape.y);
            }
        }
        // Ajoutez d'autres cas pour d'autres outils si nécessaire
    }
}
setupEventListeners();
