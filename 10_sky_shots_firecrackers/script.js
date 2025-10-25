
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
        DPR = Math.min(2, window.devicePixelRatio || 1);
        W = Math.floor(window.innerWidth);
        H = Math.floor(window.innerHeight);
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    // utilities
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
    function hueColor(base, spread = 40) { return `hsl(${Math.floor((base + rand(-spread, spread)) % 360)}, 90%, ${rand(45, 65).toFixed(0)}%)`; }

    // physics
    const gravity = 0.06;
    const wind = 0.0;

    // containers
    const rockets = [];
    const particles = [];

    class Rocket {
        constructor(x, y, tx, ty, color) {
            this.x = x; this.y = y;
            this.tx = tx; this.ty = ty;
            const dx = tx - x, dy = ty - y;
            const dist = Math.hypot(dx, dy);
            const speed = rand(4.8, 6.6);
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            this.trail = [];
            this.alive = true;
            this.color = color || hueColor(rand(0, 360));
        }
        update() {
            // record trail
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();

            // move
            this.vy += gravity * 0.02 * -1; // rockets move against gravity slightly, for smoother arc
            this.x += this.vx;
            this.y += this.vy;

            // small drag
            this.vx *= 0.999;
            this.vy *= 0.999;

            // check arrival (close to target or vy positive and passed target)
            const reached = ((this.vy > 1 && this.y < this.ty + 10) || Math.hypot(this.x - this.tx, this.y - this.ty) < 10);
            if (reached) {
                this.explode();
                this.alive = false;
            }
        }
        render(ctx) {
            // trail
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const p = this.trail[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // head glow
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 20);
            g.addColorStop(0, this.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        explode() {
            // create particles depending on mode chosen
            const mode = document.getElementById('mode').value;
            if (mode === 'star') createExplosion(this.x, this.y, this.color, 70, 'star');
            else if (mode === 'ring') createExplosion(this.x, this.y, this.color, 80, 'ring');
            else if (mode === 'flower') createExplosion(this.x, this.y, this.color, 90, 'flower');
            // optional: a secondary smaller burst
            setTimeout(() => createExplosion(this.x + rand(-12, 12), this.y + rand(-12, 12), hueColor(0), 30, 'spark'), 150);
        }
    }

    class Particle {
        constructor(x, y, vx, vy, color, life = 80, size = 2) {
            this.x = x; this.y = y;
            this.vx = vx; this.vy = vy;
            this.color = color;
            this.life = life; // frames to live
            this.maxLife = life;
            this.size = size;
            this.alpha = 1;
        }
        update() {
            this.vy += gravity * 0.3;
            this.vx += wind * 0.02;
            this.x += this.vx;
            this.y += this.vy;
            // air drag
            this.vx *= 0.995;
            this.vy *= 0.995;
            this.life--;
            this.alpha = Math.max(0, this.life / this.maxLife);
        }
        render(ctx) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(1, this.size * 4));
            grad.addColorStop(0, `rgba(${this._rgb(this.color)},${this.alpha})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);
            ctx.fillStyle = grad;
            ctx.arc(this.x, this.y, Math.max(1, this.size * 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
        _rgb(hsl) {
            // convert simple HSL string to rgb fallback for radial gradient alpha color
            // input like 'hsl(120, 90%, 60%)'
            const m = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/.exec(hsl);
            if (!m) return '255,255,255';
            const h = (+m[1]) / 360, s = (+m[2]) / 100, l = (+m[3]) / 100;
            // hsl -> rgb (approx)
            let r, g, b;
            if (s == 0) { r = g = b = l; }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                const hk = h;
                const tc = (t) => {
                    let x = t;
                    if (x < 0) x += 1;
                    if (x > 1) x -= 1;
                    if (x < 1 / 6) return p + (q - p) * 6 * x;
                    if (x < 1 / 2) return q;
                    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
                    return p;
                }
                r = tc(hk + 1 / 3); g = tc(hk); b = tc(hk - 1 / 3);
            }
            return `${Math.floor(r * 255)},${Math.floor(g * 255)},${Math.floor(b * 255)}`;
        }
    }

    // explosion helper
    function createExplosion(x, y, baseColor, count = 60, shape = 'star') {
        const baseHue = randInt(0, 360);
        if (shape === 'ring') {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const speed = rand(2.6, 5.2);
                const vx = Math.cos(angle) * speed * rand(0.85, 1.2);
                const vy = Math.sin(angle) * speed * rand(0.8, 1.1);
                const col = hueColor(baseHue, 20);
                particles.push(new Particle(x, y, vx, vy, col, randInt(45, 85), rand(1.5, 3.4)));
            }
        } else if (shape === 'flower') {
            // multiple petals (sinusoidal angle offset)
            const petals = randInt(5, 9);
            for (let i = 0; i < count; i++) {
                const t = i / count;
                const angle = t * Math.PI * 2;
                const mod = 1 + 0.6 * Math.sin(angle * petals);
                const speed = rand(2.2, 4.6) * mod;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const col = hueColor(baseHue + i * 4, 30);
                particles.push(new Particle(x, y, vx, vy, col, randInt(50, 100), rand(1.3, 3.2)));
            }
        } else if (shape === 'spark') {
            for (let i = 0; i < count; i++) {
                const angle = rand(0, Math.PI * 2);
                const speed = rand(0.8, 3.6);
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const col = hueColor(baseHue + rand(-40, 40), 60);
                particles.push(new Particle(x, y, vx, vy, col, randInt(25, 60), rand(0.8, 2.6)));
            }
        } else { // star / default
            for (let i = 0; i < count; i++) {
                const angle = rand(0, Math.PI * 2);
                const speed = rand(1.5, 5.5);
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const col = hueColor(baseHue + i * 3, 80);
                particles.push(new Particle(x, y, vx, vy, col, randInt(40, 100), rand(1.2, 3.6)));
            }
        }
    }

    // main loop
    let last = performance.now();
    function animate(now) {
        const dt = now - last;
        last = now;

        // fade background slightly to create trails
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, W, H);

        // subtle stars on background (static low alpha overlay)
        // (Optional: could draw once — but ok to keep for shimmer)
        // draw ground silhouette
        ctx.fillStyle = "rgba(2,6,12,0.9)";
        ctx.fillRect(0, H - 70, W, 70);

        // update rockets
        for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];
            r.update();
            r.render(ctx);
            if (!r.alive) rockets.splice(i, 1);
        }

        // update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.render(ctx);
            if (p.life <= 0 || p.y > H + 100) particles.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // interactions
    function fireTowards(tx, ty) {
        const startX = rand(60, W - 60);
        const startY = H - 20;
        const color = hueColor(randInt(0, 360));
        rockets.push(new Rocket(startX, startY, tx, ty, color));
    }

    // click to aim and fire
    canvas.addEventListener('pointerdown', (ev) => {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        fireTowards(x, y);
    });

    // Launch button
    document.getElementById('launchBtn').addEventListener('click', () => {
        const tx = rand(80, W - 80);
        const ty = rand(80, H * 0.45);
        fireTowards(tx, ty);
    });

    // auto launch
    let autoTimer = null;
    const autoCheckbox = document.getElementById('auto');
    autoCheckbox.addEventListener('change', () => {
        if (autoCheckbox.checked) {
            autoTimer = setInterval(() => {
                const tx = rand(80, W - 80);
                const ty = rand(80, H * 0.45);
                fireTowards(tx, ty);
            }, 900);
        } else {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    });

    // initial random bursts to look lively
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const tx = rand(100, W - 100);
                const ty = rand(80, H * 0.45);
                fireTowards(tx, ty);
            }, i * 300);
        }
    }, 400);

    // ensure canvas sized correctly at start
    resize();

    // optional: keyboard L to launch
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'l') {
            document.getElementById('launchBtn').click();
        }
    });
