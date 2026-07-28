// PlayerInput.js
// Lógica de Pan & Zoom com Inércia (Momentum) para alta qualidade de UX

let isDragging = false;
let startX = 0, startY = 0;
export let scale = 1.0;
export let panX = 0, panY = 0;

let velocityX = 0;
let velocityY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let animationFrameId = null;

const wrap = document.getElementById('canvas-wrap');
const viewport = document.getElementById('viewport');

export function applyTransform() {
    if(wrap) {
        wrap.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }
}

function applyInertia() {
    if (!isDragging && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
        panX += velocityX;
        panY += velocityY;
        
        // Fricção (desaceleração)
        velocityX *= 0.85; 
        velocityY *= 0.85;
        
        applyTransform();
        animationFrameId = requestAnimationFrame(applyInertia);
    }
}

export function initInput() {
    if (!viewport) return;

    viewport.style.cursor = 'grab';
    
    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left click
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        velocityX = 0;
        velocityY = 0;
        
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        
        // Calcula velocidade para inércia
        velocityX = e.clientX - lastMouseX;
        velocityY = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            viewport.style.cursor = 'grab';
            
            // Inicia inércia ao soltar
            if (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1) {
                animationFrameId = requestAnimationFrame(applyInertia);
            }
        }
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const oldScale = scale;
        
        if (e.deltaY < 0) {
            scale = Math.min(5.0, scale * zoomFactor);
        } else {
            scale = Math.max(0.2, scale / zoomFactor);
        }
        
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        panX = mouseX - (mouseX - panX) * (scale / oldScale);
        panY = mouseY - (mouseY - panY) * (scale / oldScale);
        
        applyTransform();
    }, { passive: false });

    // Touch logic (simplificada)
    let touchStartDist = 0;
    let touchStartScale = 1.0;
    
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            velocityX = 0;
            velocityY = 0;
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
        } else if (e.touches.length === 2) {
            isDragging = false;
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartScale = scale;
            
            startX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            startY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            
            velocityX = e.touches[0].clientX - lastMouseX;
            velocityY = e.touches[0].clientY - lastMouseY;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            
            applyTransform();
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = dist / touchStartDist;
            const oldScale = scale;
            scale = Math.min(5.0, Math.max(0.2, touchStartScale * factor));
            
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            const rect = viewport.getBoundingClientRect();
            const clientX = midX - rect.left - rect.width / 2;
            const clientY = midY - rect.top - rect.height / 2;
            
            panX = clientX - (clientX - panX) * (scale / oldScale);
            panY = clientY - (clientY - panY) * (scale / oldScale);
            
            applyTransform();
        }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
        if(isDragging) {
            isDragging = false;
            if (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1) {
                animationFrameId = requestAnimationFrame(applyInertia);
            }
        }
    });
}
