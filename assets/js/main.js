const colorPicker = document.getElementById('color-picker');
const sizeSlider = document.getElementById('size-slider');

const canvas = document.querySelector('#canvas_1');
const ctx = canvas.getContext('2d');


let currentTool = 'brush'; // Définir une variable pour l'outil actuel

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const nav_door = document.querySelector('.nav_door');

    const layout = document.querySelector('.layout');
    const radios = document.querySelectorAll('input[type="radio"]');
    const iconeBoxes = document.querySelectorAll('.icone_box');

    nav_door.addEventListener('click', function() {
        this.classList.toggle('open');
        nav.classList.toggle('open');
        layout.classList.toggle('open');
    });
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if(this.checked) {
                currentTool = this.value; // Mettre à jour l'outil actif
                this.nextElementSibling.classList.add('active');
            }
            radios.forEach(r => {
                if(r !== this) r.nextElementSibling.classList.remove('active');
            });
        });
    });
    window.addEventListener('mouseover', function(event){
        console.log(event.clientX, event.clientY);
    })
    iconeBoxes.forEach(iconeBox => {
        let hoverTimeout;

        iconeBox.addEventListener('mouseenter', function(event) {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                console.log(event.clientX, event.clientY)
                const iconeTitle = this.nextElementSibling;
                if (iconeTitle) {
                    const boxRect = this.getBoundingClientRect();
                    iconeTitle.style.display = 'block';
                    iconeTitle.style.left = `${event.clientX}px`;
                    iconeTitle.style.top = `${event.clientY}px`;
                }
            }, 1000);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => drawShapeWithProperties(shape));
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
        ctx.fillStyle = 'rgba(255,255,255,0)'; // ou la couleur de fond de votre canevas
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentTool === 'brush') {
        ctx.fillStyle = shape.color;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
