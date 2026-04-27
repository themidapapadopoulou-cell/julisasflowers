/* ══════════════════════════════════
   ENVELOPE OPEN
══════════════════════════════════ */
function openEnvelope() {
    const flap        = document.getElementById("flap");
    const envelope    = document.getElementById("envelope");
    const letterSlide = document.getElementById("letterSlide");
    const scene       = document.getElementById("envelopeScene");
    const btn         = document.getElementById("openBtn");
    const stamp       = document.getElementById("stamp");

    btn.style.display = "none";

    // open flap + fade stamp
    flap.classList.add("open");
    setTimeout(() => { if (stamp) stamp.style.opacity = "0"; }, 300);

    // letter peeks
    setTimeout(() => { letterSlide.classList.add("peek"); }, 650);

    // letter slides out fully + petals
    setTimeout(() => {
        scene.classList.add("opened");
        letterSlide.classList.remove("peek");
        letterSlide.classList.add("out");
        burstPetals();
    }, 1050);

    // envelope fades away
    setTimeout(() => { envelope.classList.add("hide"); }, 1300);
}

/* ══════════════════════════════════
   PETAL BURST
══════════════════════════════════ */
const petalColors = ["#ff9ec8","#ffb8d8","#ffd0e8","#ff6eaa","#ffaad0","#ffe0f0","#e8508a","#ffc0dc","#ff88bb"];
let petals = [];
let petalAnimating = false;

function burstPetals() {
    const canvas = document.getElementById("petalCanvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = window.innerWidth  * 0.5;
    const cy = window.innerHeight * 0.38;
    spawnPetals(canvas, cx, cy, 40);
    setTimeout(() => spawnPetals(canvas, cx, cy, 30), 200);
    setTimeout(() => spawnPetals(canvas, cx, cy, 20), 450);
    if (!petalAnimating) { petalAnimating = true; animatePetals(canvas); }
}

function spawnPetals(canvas, cx, cy, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 5.5;
        petals.push({
            x: cx + (Math.random()-.5)*60, y: cy + (Math.random()-.5)*30,
            vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 3.5,
            rot: Math.random()*Math.PI*2, rotV: (Math.random()-.5)*.18,
            w: 7+Math.random()*10, h: 4+Math.random()*6,
            color: petalColors[Math.floor(Math.random()*petalColors.length)],
            alpha: 1, life: 0, maxLife: 90+Math.random()*80,
            gravity: .07+Math.random()*.06,
            wobble: Math.random()*Math.PI*2, wobbleSpeed: .04+Math.random()*.04,
        });
    }
}

function animatePetals(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = petals.length-1; i >= 0; i--) {
        const p = petals[i];
        p.life++; p.wobble += p.wobbleSpeed;
        p.vx += Math.sin(p.wobble)*.06; p.vy += p.gravity;
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        const prog = p.life/p.maxLife;
        p.alpha = prog < .3 ? prog/.3 : prog > .7 ? (1-prog)/.3 : 1;
        if (p.life >= p.maxLife) { petals.splice(i,1); continue; }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0,0,p.w/2,p.h/2,0,0,Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fill(); ctx.restore();
    }
    if (petals.length > 0) requestAnimationFrame(() => animatePetals(canvas));
    else { petalAnimating = false; ctx.clearRect(0,0,canvas.width,canvas.height); }
}

/* ══════════════════════════════════
   FLOWER ANIMATIONS
══════════════════════════════════ */
function animateScale(el, duration) {
    const start = performance.now();
    function step(now) {
        const t = Math.min((now-start)/duration, 1);
        const c1 = 1.70158, c3 = c1+1;
        const e = 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2);
        el.setAttribute("transform","scale("+Math.max(0,e)+")");
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fadeInEl(el, duration, delay) {
    setTimeout(() => {
        const start = performance.now();
        function step(now) {
            const t = Math.min((now-start)/duration, 1);
            el.setAttribute("opacity", t.toFixed(3));
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, delay);
}

/* ══════════════════════════════════
   SPARKLE PARTICLES
══════════════════════════════════ */
const sparks = [];
let sparksActive = false;

function initParticles() {
    const canvas = document.getElementById("particles");
    const wrap = canvas.parentElement;
    canvas.width = wrap.offsetWidth; canvas.height = wrap.offsetHeight;
    sparksActive = true;
    for (let i = 0; i < 60; i++) spawnSpark(canvas.width, canvas.height, true);
    animateParticles(canvas);
}

function spawnSpark(w, h, initial) {
    sparks.push({
        x: Math.random()*w, y: initial ? Math.random()*h : h*(.2+Math.random()*.75),
        r: .4+Math.random()*2, life: initial ? Math.random() : 0,
        maxLife: .5+Math.random()*.9, speed: .003+Math.random()*.006,
        drift: (Math.random()-.5)*.35, rise: -.15-Math.random()*.45,
        warm: Math.random() > .45,
    });
}

function animateParticles(canvas) {
    if (!sparksActive) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = sparks.length-1; i >= 0; i--) {
        const s = sparks[i];
        s.life += s.speed; s.x += s.drift; s.y += s.rise;
        if (s.life > s.maxLife) { sparks.splice(i,1); spawnSpark(canvas.width,canvas.height,false); continue; }
        const prog = s.life/s.maxLife;
        const op = prog<.3 ? prog/.3 : prog>.7 ? (1-prog)/.3 : 1;
        const col = s.warm
            ? `rgba(255,${150+Math.floor(Math.random()*80)},${200+Math.floor(Math.random()*50)},`
            : `rgba(255,255,${210+Math.floor(Math.random()*45)},`;
        const grd = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*4.5);
        grd.addColorStop(0,  col+(op*.85).toFixed(2)+")");
        grd.addColorStop(.4, col+(op*.35).toFixed(2)+")");
        grd.addColorStop(1,  col+"0)");
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*4.5,0,Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = col+op.toFixed(2)+")"; ctx.fill();
    }
    requestAnimationFrame(() => animateParticles(canvas));
}

/* ══════════════════════════════════
   SHOW FLOWERS
══════════════════════════════════ */
function showFlowers() {
    const garden = document.getElementById("garden");
    setTimeout(() => {
        garden.style.opacity = "1";
        garden.style.transform = "scale(1) translateY(0)";
        const delays = [0,200,400,600,800];
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => { const s = document.getElementById("s"+i); if(s) s.style.strokeDashoffset="0"; }, delays[i-1]);
            setTimeout(() => { const f = document.getElementById("f"+i); if(f) animateScale(f,680); }, delays[i-1]+900);
        }
        [["l1a","l1b"],["l2a","l2b"],["l3a","l3b"]].forEach((pair,idx) => {
            pair.forEach((id,j) => { const el=document.getElementById(id); if(el) fadeInEl(el,600,delays[idx]+600+j*200); });
        });
        setTimeout(initParticles, 500);
    }, 300);
}

/* ══════════════════════════════════
   SECRET BUTTON + POPUP
══════════════════════════════════ */
function secretClick() {
    document.getElementById("popup").classList.add("show");
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: "themida.papadopoulou@gmail.com",
        message:  "Julisa hat auf den Knopf gedrückt – sie will echte Blumen! 🌷",
    }).catch(() => {});
}

function closePopup() {
    document.getElementById("popup").classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("popup").addEventListener("click", function(e) {
        if (e.target === this) closePopup();
    });
});
        <div id="letterSlide" class="letter-slide">
            <div id="letter" class="letter">

                <p>Ich weiß zwar nicht, wann man in Albanien Muttertag feiert, aber heute ist hier in Deutschland Muttertag.</p>
                <p>Alles Gute zu deinem ersten Muttertag.</p>
                <p>Ich habe hier ein paar Blumen für dich dagelassen.</p>
                <p>Ich würde dir gerne echte Blumen schenken. Leider kann ich das nicht, aber was ich machen kann, ist dir ein paar digitale zu schenken.</p>
                <p>Ich hoffe dir und deinem Kleinen geht es gut.</p>
                <p>Ich denke an dich.</p>

                <button class="flowerButton" onclick="showFlowers()">✦ Deine Blumen warten auf dich</button>

                <div id="garden">
                    <div class="garden-card">
                        <div class="bouquet-wrap">

                            <svg class="bouquet-svg" viewBox="0 0 480 380" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="glow-strong" x="-80%" y="-80%" width="260%" height="260%">
                                        <feGaussianBlur stdDeviation="6"  result="b1"/>
                                        <feGaussianBlur stdDeviation="14" result="b2"/>
                                        <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <filter id="glow-med" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="3.5" result="b1"/>
                                        <feGaussianBlur stdDeviation="8"   result="b2"/>
                                        <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <filter id="glow-soft" x="-35%" y="-35%" width="170%" height="170%">
                                        <feGaussianBlur stdDeviation="2.5" result="b"/>
                                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <filter id="leaf-glow" x="-30%" y="-30%" width="160%" height="160%">
                                        <feGaussianBlur stdDeviation="2" result="b"/>
                                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <radialGradient id="pet1" cx="50%" cy="40%" r="60%">
                                        <stop offset="0%"   stop-color="#ffd8ee"/>
                                        <stop offset="45%"  stop-color="#f070b0"/>
                                        <stop offset="100%" stop-color="#900050"/>
                                    </radialGradient>
                                    <radialGradient id="pet2" cx="50%" cy="38%" r="58%">
                                        <stop offset="0%"   stop-color="#ffe8f4"/>
                                        <stop offset="50%"  stop-color="#f888c8"/>
                                        <stop offset="100%" stop-color="#a81060"/>
                                    </radialGradient>
                                    <radialGradient id="pet3" cx="50%" cy="36%" r="62%">
                                        <stop offset="0%"   stop-color="#ffeaf6"/>
                                        <stop offset="55%"  stop-color="#e060a0"/>
                                        <stop offset="100%" stop-color="#780040"/>
                                    </radialGradient>
                                    <linearGradient id="leafG" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%"   stop-color="#c0205a"/>
                                        <stop offset="100%" stop-color="#600028"/>
                                    </linearGradient>
                                    <linearGradient id="leafG2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%"   stop-color="#901840"/>
                                        <stop offset="100%" stop-color="#480020"/>
                                    </linearGradient>
                                    <linearGradient id="grassG" x1="0%" y1="100%" x2="0%" y2="0%">
                                        <stop offset="0%"   stop-color="#280010"/>
                                        <stop offset="55%"  stop-color="#c02060"/>
                                        <stop offset="100%" stop-color="#e84090" stop-opacity=".35"/>
                                    </linearGradient>
                                    <linearGradient id="grassG2" x1="0%" y1="100%" x2="0%" y2="0%">
                                        <stop offset="0%"   stop-color="#180008"/>
                                        <stop offset="55%"  stop-color="#880038"/>
                                        <stop offset="100%" stop-color="#b02868" stop-opacity=".28"/>
                                    </linearGradient>
                                    <radialGradient id="groundG" cx="50%" cy="70%" r="52%">
                                        <stop offset="0%"   stop-color="#c02860" stop-opacity=".2"/>
                                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                                    </radialGradient>
                                </defs>

                                <ellipse cx="240" cy="355" rx="210" ry="55" fill="url(#groundG)"/>

                                <!-- back grass -->
                                <path d="M 44 375 Q 24 305 14 235"    stroke="url(#grassG2)" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".65"/>
                                <path d="M 54 375 Q 36 295 52 208"    stroke="url(#grassG)"  stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>
                                <path d="M 64 375 Q 56 318 80 248"    stroke="url(#grassG2)" stroke-width="1"   fill="none" stroke-linecap="round" opacity=".55"/>
                                <path d="M 34 375 Q 12 328  2 268"    stroke="url(#grassG2)" stroke-width="1"   fill="none" stroke-linecap="round" opacity=".45"/>
                                <path d="M 74 375 Q 74 326 96 264"    stroke="url(#grassG)"  stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>
                                <path d="M 108 375 Q 86 318 70 238"   stroke="url(#grassG)"  stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
                                <path d="M 120 375 Q 106 328 116 258" stroke="url(#grassG2)" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"/>
                                <path d="M 356 375 Q 370 318 360 243" stroke="url(#grassG)"  stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
                                <path d="M 368 375 Q 388 328 398 253" stroke="url(#grassG2)" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"/>
                                <path d="M 378 375 Q 396 338 416 283" stroke="url(#grassG)"  stroke-width="1"   fill="none" stroke-linecap="round" opacity=".5"/>
                                <path d="M 416 375 Q 438 308 450 236" stroke="url(#grassG2)" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".65"/>
                                <path d="M 426 375 Q 440 298 426 210" stroke="url(#grassG)"  stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>
                                <path d="M 436 375 Q 450 318 472 246" stroke="url(#grassG2)" stroke-width="1"   fill="none" stroke-linecap="round" opacity=".55"/>
                                <path d="M 446 375 Q 466 338 474 273" stroke="url(#grassG)"  stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>

                                <!-- stems -->
                                <path id="s1" class="stem" d="M 240 362 Q 232 278 240 112" stroke="#e040a0" stroke-width="2.2" fill="none" stroke-linecap="round" filter="url(#glow-soft)"/>
                                <path id="s2" class="stem" d="M 222 362 Q 200 285 168 145" stroke="#d03090" stroke-width="2"   fill="none" stroke-linecap="round" filter="url(#glow-soft)"/>
                                <path id="s3" class="stem" d="M 258 362 Q 278 285 312 148" stroke="#d03090" stroke-width="2"   fill="none" stroke-linecap="round" filter="url(#glow-soft)"/>
                                <path id="s4" class="stem" d="M 205 362 Q 168 308 110 190" stroke="#b02070" stroke-width="1.7" fill="none" stroke-linecap="round" filter="url(#glow-soft)"/>
                                <path id="s5" class="stem" d="M 275 362 Q 312 308 370 192" stroke="#b02070" stroke-width="1.7" fill="none" stroke-linecap="round" filter="url(#glow-soft)"/>

                                <!-- leaves -->
                                <g id="l1a" opacity="0"><path d="M 237 258 C 210 246 190 226 200 208 C 210 194 232 212 237 258Z" fill="url(#leafG)" filter="url(#leaf-glow)"/><path d="M 237 258 C 210 248 196 232 202 212" stroke="#f060a0" stroke-width=".7" fill="none" opacity=".45"/></g>
                                <g id="l1b" opacity="0"><path d="M 243 228 C 270 216 292 198 280 180 C 268 166 247 186 243 228Z" fill="url(#leafG2)" filter="url(#leaf-glow)"/><path d="M 243 228 C 268 218 288 202 278 184" stroke="#f060a0" stroke-width=".7" fill="none" opacity=".45"/></g>
                                <g id="l2a" opacity="0"><path d="M 192 276 C 168 262 156 240 168 226 C 178 214 198 232 192 276Z" fill="url(#leafG)" filter="url(#leaf-glow)"/></g>
                                <g id="l2b" opacity="0"><path d="M 184 246 C 160 234 146 214 160 200 C 170 188 190 206 184 246Z" fill="url(#leafG2)" filter="url(#leaf-glow)"/></g>
                                <g id="l3a" opacity="0"><path d="M 288 276 C 312 262 324 240 312 226 C 302 214 282 232 288 276Z" fill="url(#leafG)" filter="url(#leaf-glow)"/></g>
                                <g id="l3b" opacity="0"><path d="M 296 246 C 320 234 334 214 320 200 C 310 188 290 206 296 246Z" fill="url(#leafG2)" filter="url(#leaf-glow)"/></g>

                                <!-- F1 -->
                                <g transform="translate(240,112)"><g id="f1" transform="scale(0)">
                                    <path d="M0,0 C-12,-34 -34,-46 -24,-64 C-14,-78 10,-70 0,-44Z" fill="url(#pet1)" transform="rotate(-72)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-12,-34 -34,-46 -24,-64 C-14,-78 10,-70 0,-44Z" fill="url(#pet1)" transform="rotate(-36)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-12,-34 -34,-46 -24,-64 C-14,-78 10,-70 0,-44Z" fill="url(#pet1)" transform="rotate(0)"    filter="url(#glow-med)"/>
                                    <path d="M0,0 C-12,-34 -34,-46 -24,-64 C-14,-78 10,-70 0,-44Z" fill="url(#pet1)" transform="rotate(36)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-12,-34 -34,-46 -24,-64 C-14,-78 10,-70 0,-44Z" fill="url(#pet1)" transform="rotate(72)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-22 -22,-32 -16,-46 C-8,-56 8,-48 0,-28Z"    fill="url(#pet2)" transform="rotate(-54)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-8,-22 -22,-32 -16,-46 C-8,-56 8,-48 0,-28Z"    fill="url(#pet2)" transform="rotate(-18)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-8,-22 -22,-32 -16,-46 C-8,-56 8,-48 0,-28Z"    fill="url(#pet2)" transform="rotate(18)"   filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-8,-22 -22,-32 -16,-46 C-8,-56 8,-48 0,-28Z"    fill="url(#pet2)" transform="rotate(54)"   filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-8,-22 -22,-32 -16,-46 C-8,-56 8,-48 0,-28Z"    fill="url(#pet2)" transform="rotate(90)"   filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-5,-14 -12,-20 -9,-30 C-4,-38 6,-34 0,-18Z"     fill="url(#pet3)" transform="rotate(-36)"/>
                                    <path d="M0,0 C-5,-14 -12,-20 -9,-30 C-4,-38 6,-34 0,-18Z"     fill="url(#pet3)" transform="rotate(0)"/>
                                    <path d="M0,0 C-5,-14 -12,-20 -9,-30 C-4,-38 6,-34 0,-18Z"     fill="url(#pet3)" transform="rotate(36)"/>
                                    <path d="M0,0 C-5,-14 -12,-20 -9,-30 C-4,-38 6,-34 0,-18Z"     fill="url(#pet3)" transform="rotate(72)"/>
                                    <path d="M0,0 C-5,-14 -12,-20 -9,-30 C-4,-38 6,-34 0,-18Z"     fill="url(#pet3)" transform="rotate(108)"/>
                                    <circle r="12" fill="#ffd0ea" filter="url(#glow-strong)" opacity=".9"/>
                                    <circle r="7"  fill="#fff0f8"/><circle r="3" fill="#f8c0e0"/>
                                </g></g>

                                <!-- F2 -->
                                <g transform="translate(168,145)"><g id="f2" transform="scale(0)">
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(0)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(51)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(102)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(153)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(204)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(255)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(306)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(25)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(76)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(127)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(178)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(229)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(280)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(331)" filter="url(#glow-soft)"/>
                                    <circle r="10" fill="#ffd4ec" filter="url(#glow-strong)" opacity=".85"/>
                                    <circle r="6" fill="#fff4fa"/><circle r="2.5" fill="#f0b0d8"/>
                                </g></g>

                                <!-- F3 -->
                                <g transform="translate(312,148)"><g id="f3" transform="scale(0)">
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(0)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(51)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(102)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(153)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(204)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(255)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-10,-30 -28,-42 -20,-58 C-12,-70 8,-62 0,-40Z" fill="url(#pet1)" transform="rotate(306)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(25)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(76)"  filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(127)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(178)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(229)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(280)" filter="url(#glow-soft)"/>
                                    <path d="M0,0 C-6,-18 -16,-28 -12,-40 C-6,-50 6,-44 0,-26Z"   fill="url(#pet2)" transform="rotate(331)" filter="url(#glow-soft)"/>
                                    <circle r="10" fill="#ffd4ec" filter="url(#glow-strong)" opacity=".85"/>
                                    <circle r="6" fill="#fff4fa"/><circle r="2.5" fill="#f0b0d8"/>
                                </g></g>

                                <!-- F4 -->
                                <g transform="translate(110,190)"><g id="f4" transform="scale(0)">
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(0)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(60)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(120)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(180)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(240)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(300)" filter="url(#glow-med)"/>
                                    <circle r="9" fill="#ffd8f0" filter="url(#glow-strong)" opacity=".8"/>
                                    <circle r="5" fill="#fff8fc"/>
                                </g></g>

                                <!-- F5 -->
                                <g transform="translate(370,192)"><g id="f5" transform="scale(0)">
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(0)"   filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(60)"  filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(120)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(180)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(240)" filter="url(#glow-med)"/>
                                    <path d="M0,0 C-8,-26 -22,-36 -16,-50 C-9,-62 7,-55 0,-34Z" fill="url(#pet2)" transform="rotate(300)" filter="url(#glow-med)"/>
                                    <circle r="9" fill="#ffd8f0" filter="url(#glow-strong)" opacity=".8"/>
                                    <circle r="5" fill="#fff8fc"/>
                                </g></g>

                                <!-- front grass -->
                                <path d="M 150 375 Q 132 328 142 268" stroke="url(#grassG)"  stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
                                <path d="M 164 375 Q 150 342 162 290" stroke="url(#grassG2)" stroke-width="1"   fill="none" stroke-linecap="round" opacity=".5"/>
                                <path d="M 320 375 Q 336 328 328 268" stroke="url(#grassG)"  stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
                                <path d="M 334 375 Q 352 342 344 288" stroke="url(#grassG2)" stroke-width="1"   fill="none" stroke-linecap="round" opacity=".5"/>
                                <path d="M 226 375 Q 213 352 218 310" stroke="url(#grassG)"  stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".45"/>
                                <path d="M 254 375 Q 267 352 264 310" stroke="url(#grassG)"  stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".45"/>
                            </svg>

                            <canvas id="particles"></canvas>
                        </div>
                    </div>
                </div><!-- end garden -->

                <button class="secretButton" onclick="secretClick()">
                    vielleicht willst du doch echte? trau dich 🌷
                </button>

            </div><!-- end letter -->
        </div><!-- end letterSlide -->

        <!-- popup -->
        <div class="popup-overlay" id="popup">
            <div class="popup-card">
                <button class="popup-close" onclick="closePopup()">✕</button>
                <p>wusste ich's doch 😄</p>
                <p>das leben ist zu kurz für nur digitale blumen 🌷</p>
                <p>eine frau wie du verdient mehr als nur digitale –<br>echte stehen dir sowieso am besten</p>
                <p>wir kriegen das schon irgendwie hin 😄</p>
                <p>mir fällt bestimmt was ein,<br>wie sie ihren weg zu dir finden 🌷</p>
            </div>
        </div>

        <div id="envelope" class="envelope">
            <div id="flap" class="flap"></div>
            <!-- wax stamp: centered on flap triangle tip (flap height=120px, triangle tip at bottom = ~120px from top) -->
            <div class="frontText">
                <svg class="stamp-flower" viewBox="-34 -34 68 68" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="waxG" cx="38%" cy="32%" r="62%">
                            <stop offset="0%"   stop-color="#c0392b"/>
                            <stop offset="55%"  stop-color="#8b1a1a"/>
                            <stop offset="100%" stop-color="#4a0a0a"/>
                        </radialGradient>
                    </defs>
                    <!-- 8 rounded petals forming the flower stamp shape -->
                    <g fill="url(#waxG)">
                        <ellipse rx="13" ry="20" transform="rotate(0)"/>
                        <ellipse rx="13" ry="20" transform="rotate(45)"/>
                        <ellipse rx="13" ry="20" transform="rotate(90)"/>
                        <ellipse rx="13" ry="20" transform="rotate(135)"/>
                    </g>
                    <!-- centre circle on top -->
                    <circle r="16" fill="url(#waxG)"/>
                    <!-- inner decorative ring -->
                    <circle r="13" fill="none" stroke="rgba(255,200,180,0.3)" stroke-width="1"/>
                </svg>
            </div>
        </div>

    </div>

    <button class="openButton" id="openBtn" onclick="openEnvelope()">Öffnen</button>

</div>

<script src="script.js"></script>

</body>
</html>    ctx.rotate(p.rot);

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
