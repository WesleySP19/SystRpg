// ParticleEngine – lightweight canvas particle system for cinematic UI
// Usage: const engine = new ParticleEngine(canvas, {density: 80, depthRange: [1,4]}); engine.start(); engine.stop();

export default class ParticleEngine {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element where particles are drawn
   * @param {Object} options
   * @param {number} options.density - Approx. number of particles on screen
   * @param {Array<number>} options.depthRange - [minDepth, maxDepth] controls size/blur
   */
  constructor(canvas, { density = 60, depthRange = [1, 3] } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.density = density;
    this.minDepth = depthRange[0];
    this.maxDepth = depthRange[1];
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  // Initialize particle list
  initParticles() {
    const count = this.density;
    const { width, height } = this.canvas;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const depth = this.random(this.minDepth, this.maxDepth);
      const size = (1 / depth) * 3 + 1; // smaller for farther particles
      const opacity = 0.4 + (1 - depth / this.maxDepth) * 0.5;
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size,
        opacity,
        depth,
      });
    }
  }

  // Resize canvas to fill parent
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.initParticles();
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  start() {
    if (this.animationId) return;
    this.initParticles();
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.clear();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    const { width, height } = this.canvas;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }
  }

  draw() {
    const ctx = this.ctx;
    this.clear();
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();
    }
  }
}
