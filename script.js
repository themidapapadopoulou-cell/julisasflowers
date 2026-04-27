/* ══════════════════════════════════════════
   SECRET BUTTON
   ══════════════════════════════════════════ */

function secretClick() {
    // show the popup
    document.getElementById("popup").classList.add("show");

    // send email notification via EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: "themida.papadopoulou@gmail.com",
        message:  "Julisa hat auf den Knopf gedrückt – sie will echte Blumen! 🌷",
    }).catch(() => {
        // silent fail – popup still works even if email fails
    });
}

function closePopup() {
    document.getElementById("popup").classList.remove("show");
}

// also close popup if clicking the dark overlay background
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("popup").addEventListener("click", function(e) {
        if (e.target === this) closePopup();
    });
});




const petalColors = [
    "#ff9ec8", "#ffb8d8", "#ffd0e8",
    "#ff6eaa", "#ffaad0", "#ffe0f0",
    "#e8508a", "#ffc0dc", "#ff88bb"
];

let petals = [];
let petalCanvas, petalCtx;
let petalActive = false;

function initPetalCanvas() {
    petalCanvas = document.getElementById("petalCanvas");
    petalCtx    = petalCanvas.getContext("2d");
    petalCanvas.width  = window.innerWidth;
    petalCanvas.height = window.innerHeight;
}

function spawnPetalBurst(count) {
    // burst from center-top area (where envelope is)
    const cx = window.innerWidth  * 0.5;
    const cy = window.innerHeight * 0.35;

    for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 2.5 + Math.random() * 5.5;
        petals.push({
            x:    cx + (Math.random() - 0.5) * 60,
            y:    cy + (Math.random() - 0.5) * 30,
            vx:   Math.cos(angle) * speed,
            vy:   Math.sin(angle) * speed - 3.5,   // bias upward
            rot:  Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.18,
            w:    7  + Math.random() * 10,
            h:    4  + Math.random() * 6,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            alpha: 1,
            life:  0,
            maxLife: 90 + Math.random() * 80,
            gravity: 0.07 + Math.random() * 0.06,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.04 + Math.random() * 0.04,
        });
    }
}

function drawPetal(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // draw as a soft ellipse with a slight curve
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 6;
    ctx.fill();
    ctx.restore();
}

function animatePetals() {
    if (!petalActive) return;
    petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

    for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.life++;
        p.wobble += p.wobbleSpeed;
        p.vx     += Math.sin(p.wobble) * 0.06;  // gentle side wobble
        p.vy     += p.gravity;
        p.x      += p.vx;
        p.y      += p.vy;
        p.rot    += p.rotV;

        // fade out in last 30 frames
        const fadeStart = p.maxLife - 30;
        if (p.life > fadeStart) {
            p.alpha = 1 - (p.life - fadeStart) / 30;
        }

        if (p.life >= p.maxLife) {
            petals.splice(i, 1);
            continue;
        }
        drawPetal(petalCtx, p);
    }

    if (petals.length > 0) {
        requestAnimationFrame(animatePetals);
    } else {
        petalActive = false;
        petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    }
}

function burstPetals() {
    initPetalCanvas();
    petalActive = true;

    // first burst immediately
    spawnPetalBurst(35);
    animatePetals();

    // second wave after a beat
    setTimeout(() => { spawnPetalBurst(30); }, 200);
    // third trickle
    setTimeout(() => { spawnPetalBurst(20); }, 480);
}


/* ══════════════════════════════════════════
   ENVELOPE OPEN
   ══════════════════════════════════════════ */

function openEnvelope() {
    const flap        = document.getElementById("flap");
    const envelope    = document.getElementById("envelope");
    const letterSlide = document.getElementById("letterSlide");
    const openBtn     = document.getElementById("openBtn");

    openBtn.style.display = "none";

    // step 1: open flap + fade stamp
    flap.classList.add("open");
    setTimeout(() => {
        const stamp = document.querySelector(".frontText");
        if (stamp) stamp.style.opacity = "0";
    }, 300);

    // step 2: after flap is fully open, letter peeks out
    setTimeout(() => {
        letterSlide.classList.add("slide-peek");
    }, 650);

    // step 3: letter slides fully out + petals burst
    setTimeout(() => {
        document.getElementById("envelopeScene").classList.add("open");
        letterSlide.classList.remove("slide-peek");
        letterSlide.classList.add("slide-out");
        burstPetals();
    }, 1050);

    // step 4: envelope fades away
    setTimeout(() => {
        envelope.classList.add("hide");
    }, 1250);
}


/* ══════════════════════════════════════════
   FLOWER ANIMATIONS
   ══════════════════════════════════════════ */

function animateScale(el, duration) {
    const start = performance.now();
    function step(now) {
        const t  = Math.min((now - start) / duration, 1);
        const c1 = 1.70158, c3 = c1 + 1;
        const e  = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        el.setAttribute("transform", "scale(" + Math.max(0, e) + ")");
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fadeIn(el, duration, delay) {
    setTimeout(() => {
        const start = performance.now();
        function step(now) {
            const t = Math.min((now - start) / duration, 1);
            el.setAttribute("opacity", t.toFixed(3));
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, delay);
}


/* ══════════════════════════════════════════
   SPARKLE PARTICLES (in flower garden)
   ══════════════════════════════════════════ */

const sparks = [];
let particleActive = false;

function initParticles() {
    const canvas = document.getElementById("particles");
    const wrap   = canvas.parentElement;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    canvas.style.position = "absolute";
    canvas.style.top  = "0";
    canvas.style.left = "0";
    canvas.style.width  = "100%";
    canvas.style.height = "100%";
    particleActive = true;
    for (let i = 0; i < 60; i++) spawnSpark(canvas.width, canvas.height, true);
    animateParticles(canvas);
}

function spawnSpark(w, h, initial) {
    sparks.push({
        x:       Math.random() * w,
        y:       initial ? Math.random() * h : h * (.2 + Math.random() * .75),
        r:       .4 + Math.random() * 2,
        life:    initial ? Math.random() : 0,
        maxLife: .5 + Math.random() * .9,
        speed:   .003 + Math.random() * .006,
        drift:   (Math.random() - .5) * .35,
        rise:    -.15 - Math.random() * .45,
        warm:    Math.random() > .45,
    });
}

function animateParticles(canvas) {
    if (!particleActive) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += s.speed;
        s.x    += s.drift;
        s.y    += s.rise;

        if (s.life > s.maxLife) {
            sparks.splice(i, 1);
            spawnSpark(canvas.width, canvas.height, false);
            continue;
        }

        const prog = s.life / s.maxLife;
        const op   = prog < .3 ? prog / .3 : prog > .7 ? (1 - prog) / .3 : 1;
        const col  = s.warm
            ? `rgba(255,${150 + Math.floor(Math.random()*80)},${200 + Math.floor(Math.random()*50)},`
            : `rgba(255,255,${210 + Math.floor(Math.random()*45)},`;

        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4.5);
        grd.addColorStop(0,  col + (op * .85).toFixed(2) + ")");
        grd.addColorStop(.4, col + (op * .35).toFixed(2) + ")");
        grd.addColorStop(1,  col + "0)");

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = col + op.toFixed(2) + ")";
        ctx.fill();
    }
    requestAnimationFrame(() => animateParticles(canvas));
}


/* ══════════════════════════════════════════
   SHOW FLOWERS
   ══════════════════════════════════════════ */

function showFlowers() {
    const garden = document.getElementById("garden");

    setTimeout(() => {
        garden.style.opacity   = "1";
        garden.style.transform = "scale(1) translateY(0)";

        const stemDelays = [0, 200, 400, 600, 800];

        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                const s = document.getElementById("s" + i);
                if (s) s.style.strokeDashoffset = "0";
            }, stemDelays[i - 1]);

            setTimeout(() => {
                const f = document.getElementById("f" + i);
                if (f) animateScale(f, 680);
            }, stemDelays[i - 1] + 900);
        }

        [["l1a","l1b"], ["l2a","l2b"], ["l3a","l3b"]].forEach((pair, idx) => {
            pair.forEach((id, j) => {
                const el = document.getElementById(id);
                if (el) fadeIn(el, 600, stemDelays[idx] + 600 + j * 200);
            });
        });

        setTimeout(initParticles, 500);
    }, 300);
}
