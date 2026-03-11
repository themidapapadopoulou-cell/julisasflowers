function openEnvelope() {
    const flap   = document.getElementById("flap");
    const env    = document.getElementById("envelope");
    const slide  = document.getElementById("letterSlide");
    const btn    = document.getElementById("openBtn");

    // hide button
    btn.classList.add("hidden");

    // 1. flap opens
    flap.classList.add("open");

    // 2. letter peeks out from inside envelope
    setTimeout(() => {
        slide.classList.add("peek");
    }, 500);

    // 3. letter slides fully out upward
    setTimeout(() => {
        slide.classList.remove("peek");
        slide.classList.add("out");
    }, 1100);

    // 4. envelope fades away once letter is clear
    setTimeout(() => {
        env.classList.add("dissolve");
    }, 1600);
}

/* ── scale animation (bounce easing) ── */
function animateScale(el, duration) {
    const start = performance.now();
    function step(now) {
        const t  = Math.min((now - start) / duration, 1);
        const c1 = 1.70158, c3 = c1 + 1;
        const e  = 1 + c3 * Math.pow(t-1,3) + c1 * Math.pow(t-1,2);
        el.setAttribute("transform", "scale(" + Math.max(0,e) + ")");
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

/* ── particles ── */
const sparks = [];
let particleActive = false;

function initParticles() {
    const canvas = document.getElementById("particles");
    const wrap   = canvas.parentElement;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    particleActive = true;
    for (let i = 0; i < 60; i++) spawnSpark(canvas.width, canvas.height, true);
    animateParticles(canvas);
}

function spawnSpark(w, h, initial) {
    sparks.push({
        x: Math.random() * w,
        y: initial ? Math.random() * h : h * (.2 + Math.random() * .75),
        r: .4 + Math.random() * 2,
        life: initial ? Math.random() : 0,
        maxLife: .5 + Math.random() * .9,
        speed: .003 + Math.random() * .006,
        drift: (Math.random() - .5) * .35,
        rise: -.15 - Math.random() * .45,
        warm: Math.random() > .45,
    });
}

function animateParticles(canvas) {
    if (!particleActive) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += s.speed; s.x += s.drift; s.y += s.rise;
        if (s.life > s.maxLife) {
            sparks.splice(i, 1);
            spawnSpark(canvas.width, canvas.height, false);
            continue;
        }
        const prog = s.life / s.maxLife;
        const op   = prog < .3 ? prog/.3 : prog > .7 ? (1-prog)/.3 : 1;
        const col  = s.warm
            ? `rgba(255,${150+Math.floor(Math.random()*80)},${200+Math.floor(Math.random()*50)},`
            : `rgba(255,255,${210+Math.floor(Math.random()*45)},`;
        const grd = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*4.5);
        grd.addColorStop(0,  col+(op*.85).toFixed(2)+")");
        grd.addColorStop(.4, col+(op*.35).toFixed(2)+")");
        grd.addColorStop(1,  col+"0)");
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*4.5,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=col+op.toFixed(2)+")"; ctx.fill();
    }
    requestAnimationFrame(() => animateParticles(canvas));
}

/* ── show flowers ── */
function showFlowers() {
    const garden = document.getElementById("garden");
    setTimeout(() => {
        garden.style.opacity   = "1";
        garden.style.transform = "scale(1) translateY(0)";
        const stemDelays = [0,200,400,600,800];
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                const s = document.getElementById("s"+i);
                if (s) s.style.strokeDashoffset = "0";
            }, stemDelays[i-1]);
            setTimeout(() => {
                const f = document.getElementById("f"+i);
                if (f) animateScale(f, 680);
            }, stemDelays[i-1] + 900);
        }
        [["l1a","l1b"],["l2a","l2b"],["l3a","l3b"]].forEach((pair,idx) => {
            pair.forEach((id,j) => {
                const el = document.getElementById(id);
                if (el) fadeIn(el, 600, stemDelays[idx]+600+j*200);
            });
        });
        setTimeout(initParticles, 500);
    }, 300);
}
