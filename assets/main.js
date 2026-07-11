/* Cyber Sec — Enterprise Cybersecurity · interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── rotating wireframe earth globe ── */
  (function () {
    var canvas = document.getElementById("globe-canvas");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var R = 26, cx = 30, cy = 30;
    var angle = 0;
    var latLines = 7, lonLines = 10;

    function drawGlobe() {
      ctx.clearRect(0, 0, 60, 60);

      ctx.strokeStyle = "rgba(30,128,255,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      var i, j, lat, lon;
      for (i = 1; i < latLines; i++) {
        lat = -90 + (180 * i / latLines);
        ctx.beginPath();
        var first = true;
        for (j = 0; j <= 360; j += 3) {
          lon = (j + angle) * Math.PI / 180;
          var phi = (90 - lat) * Math.PI / 180;
          var x = R * Math.sin(phi) * Math.cos(lon);
          var y = R * Math.cos(phi);
          var z = R * Math.sin(phi) * Math.sin(lon);
          if (z > -R * 0.15) {
            if (first) { ctx.moveTo(cx + x, cy - y); first = false; }
            else ctx.lineTo(cx + x, cy - y);
          } else { first = true; }
        }
        ctx.strokeStyle = "rgba(30,128,255,0.45)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      for (i = 0; i < lonLines; i++) {
        lon = (360 * i / lonLines + angle) * Math.PI / 180;
        ctx.beginPath();
        var first = true;
        for (j = -90; j <= 90; j += 3) {
          lat = j * Math.PI / 180;
          var x = R * Math.cos(lat) * Math.cos(lon);
          var y = R * Math.sin(lat);
          var z = R * Math.cos(lat) * Math.sin(lon);
          if (first) { ctx.moveTo(cx + x, cy - y); first = false; }
          else ctx.lineTo(cx + x, cy - y);
        }
        ctx.strokeStyle = "rgba(30,128,255,0.35)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      angle = (angle + 0.35) % 360;
      requestAnimationFrame(drawGlobe);
    }
    drawGlobe();
  })();

  /* ── background wave + wireframe + grid sweep ── */
  (function () {
    var canvas = document.getElementById("bg-canvas");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var W, H, time = 0;
    var gridSweep = { active: false, startT: 0, duration: 4000 };
    var nodes = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      nodes = [];
      for (var n = 0; n < 18; n++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: 1 + Math.random() * 2.5
        });
      }
    }
    window.addEventListener("resize", resize);
    resize();

    function scheduleSweep() {
      setTimeout(function loop() {
        gridSweep.active = true;
        gridSweep.startT = performance.now();
        setTimeout(loop, 60000);
      }, 60000);
    }
    scheduleSweep();

    function drawWireframeGrid(alpha) {
      var size = 44;
      ctx.strokeStyle = "rgba(20,100,220," + alpha + ")";
      ctx.lineWidth = 0.5;
      var x, y;
      for (x = 0; x < W; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (y = 0; y < H; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    function drawWaves() {
      var w;
      for (w = 0; w < 7; w++) {
        var amp = 55 + w * 16;
        var freq = 0.0023 + w * 0.0006 + Math.sin(time * 0.00012 + w) * 0.0004;
        var speed = 0.00045 + w * 0.00018;
        var yBase = H * (0.15 + w * 0.11);
        var alpha = 0.10 - w * 0.01;

        ctx.beginPath();
        for (var x = 0; x < W; x += 2) {
          var y = yBase + Math.sin(x * freq + time * speed) * amp +
                  Math.sin(x * freq * 2.5 + time * speed * 1.3) * (amp * 0.3) +
                  Math.sin(x * freq * 0.4 + time * speed * 0.6) * (amp * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(26,120,255," + alpha + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (w = 0; w < 4; w++) {
        var ax = Math.sin(time * 0.00025 + w * 2.1) * W * 0.32 + W * 0.5;
        var ay = Math.cos(time * 0.0003 + w * 1.7) * H * 0.28 + H * 0.45;
        ctx.beginPath();
        ctx.arc(ax, ay, 35 + w * 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(26,160,255," + (0.025 - w * 0.004) + ")";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    function drawNodes() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26,160,255,0.35)";
        ctx.fill();

        for (var j = i + 1; j < nodes.length; j++) {
          var dx = n.x - nodes[j].x, dy = n.y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = "rgba(26,120,255," + (0.1 * (1 - dist / 160)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function drawSweep() {
      if (!gridSweep.active) return;
      var elapsed = performance.now() - gridSweep.startT;
      if (elapsed > gridSweep.duration) { gridSweep.active = false; return; }

      var prog = elapsed / gridSweep.duration;
      var ease = prog < 0.3 ? prog / 0.3 : 1 - (prog - 0.3) / 0.7;
      var sweepX = prog * W;
      var sweepW = 160 + Math.sin(prog * Math.PI) * 80;
      var boxSize = 26;
      var gap = 10;
      var step = boxSize + gap;
      var x, y;

      for (y = 0; y < H; y += step) {
        for (x = sweepX - sweepW / 2; x < sweepX + sweepW / 2; x += step) {
          if (x < -boxSize || x > W + boxSize) continue;
          var fx = x + Math.sin(y * 0.025 + prog * 25) * 5;
          var distFromCenter = Math.abs(x - sweepX) / (sweepW / 2);
          var boxAlpha = 0.85 * (1 - distFromCenter * 0.4);

          ctx.fillStyle = "rgba(0,0,0," + boxAlpha + ")";
          ctx.fillRect(fx, y, boxSize, boxSize);

          ctx.strokeStyle = "rgba(26,140,255," + (0.75 * (1 - distFromCenter * 0.3)) + ")";
          ctx.lineWidth = 1;
          ctx.strokeRect(fx, y, boxSize, boxSize);

          ctx.strokeStyle = "rgba(26,160,255," + (0.22 * (1 - distFromCenter * 0.3)) + ")";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(fx + boxSize * 0.15, y + boxSize * 0.15);
          ctx.lineTo(fx + boxSize * 0.85, y + boxSize * 0.85);
          ctx.moveTo(fx + boxSize * 0.85, y + boxSize * 0.15);
          ctx.lineTo(fx + boxSize * 0.15, y + boxSize * 0.85);
          ctx.stroke();
        }
      }

      var glow = ctx.createRadialGradient(sweepX, H / 2, 0, sweepX, H / 2, sweepW);
      glow.addColorStop(0, "rgba(26,140,255,0.12)");
      glow.addColorStop(1, "rgba(26,140,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(sweepX - sweepW, 0, sweepW * 2, H);

      var particleCount = 50;
      for (var p = 0; p < particleCount; p++) {
        var px = sweepX + (Math.random() - 0.5) * sweepW * 1.5;
        var py = Math.random() * H;
        ctx.fillStyle = "rgba(26,180,255," + (0.35 + Math.random() * 0.5) + ")";
        ctx.fillRect(px, py, 2.5, 2.5);

        ctx.beginPath();
        ctx.arc(px, py, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26,180,255," + (0.06 + Math.random() * 0.08) + ")";
        ctx.fill();
      }
    }

    function draw(t) {
      time = t;
      ctx.clearRect(0, 0, W, H);
      drawWireframeGrid(0.06);
      drawWaves();
      drawNodes();
      drawSweep();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* day-of-week colour rotation */
  (function () {
    var palette = [
      ["#1e80ff", "#0d4bb3", "rgba(30,128,255,0.35)"],   /* Sun — Deep Blue */
      ["#1e80ff", "#0d4bb3", "rgba(30,128,255,0.35)"],   /* Mon — Cyber Sec Blue */
      ["#0088dd", "#0066aa", "rgba(0,136,221,0.35)"],    /* Tue — Ocean Blue */
      ["#1050cc", "#0a3888", "rgba(16,80,204,0.35)"],    /* Wed — Navy Blue */
      ["#00aadd", "#0077aa", "rgba(0,170,221,0.35)"],    /* Thu — Electric Blue */
      ["#1838cc", "#1028a0", "rgba(24,56,204,0.35)"],    /* Fri — Midnight Blue */
      ["#1a60e0", "#1240aa", "rgba(26,96,224,0.35)"]     /* Sat — Cobalt Blue */
    ];
    var c = palette[new Date().getDay()];
    var root = document.documentElement;
    root.style.setProperty("--acc", c[0]);
    root.style.setProperty("--acc-deep", c[1]);
    root.style.setProperty("--acc-glow", c[2]);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", c[0]);
  })();

  /* current year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* header scrolled state + back-to-top */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var s = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", s > 8);
    if (toTop) toTop.classList.toggle("show", s > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var mnav = document.getElementById("mobile-nav");
  if (toggle && mnav) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mnav.hidden = false;
      mnav.dataset.open = String(open);
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        mnav.dataset.open = "false";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mnav.hidden = true;
      });
    });
  }

  /* scroll reveal (staggered per section) */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = Array.prototype.slice.call(e.target.parentNode.children).filter(function (n) { return n.classList.contains("reveal"); });
        var i = Math.max(0, sibs.indexOf(e.target));
        e.target.style.transitionDelay = Math.min(i * 50, 350) + "ms";
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* terminal typing effect */
  var typeEl = document.querySelector(".type");
  if (typeEl) {
    var text = typeEl.getAttribute("data-type") || "";
    if (reduce) {
      typeEl.textContent = text;
    } else {
      var i = 0;
      var start = function () {
        var t = setInterval(function () {
          typeEl.textContent = text.slice(0, i++);
          if (i > text.length) clearInterval(t);
        }, 16);
      };
      // begin shortly after load
      setTimeout(start, 650);
    }
  }

  /* forms — mailto compose by default; Formspree/Web3Forms if data-endpoint set.
     Works for any <form data-mailto="addr" data-subject="…"> (contact + facts). */
  var forms = document.querySelectorAll("form[data-mailto]");
  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector(".form-status");
    var to = form.getAttribute("data-mailto") || "stephanbotesIT@proton.me";
    var subjectBase = form.getAttribute("data-subject") || "Website enquiry";

    function collect() {
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.type !== "submit" && el.type !== "button") data[el.name] = (el.value || "").trim();
      });
      return data;
    }

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return; // let the browser show validation UI
      e.preventDefault();
      var data = collect();
      var endpoint = (form.getAttribute("data-endpoint") || "").trim();

      if (endpoint) {
        if (status) status.textContent = "Sending…";
        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (r.ok) { form.reset(); if (status) status.textContent = "Sent — I'll be in touch shortly."; }
          else throw new Error();
        }).catch(function () {
          if (status) status.textContent = "Couldn't send. Email " + to + " directly.";
        });
        return;
      }

      /* default: open the user's mail client with a prefilled message */
      var who = data.name ? " (" + data.name + ")" : "";
      var subject = data.engagement ? subjectBase + " — " + data.engagement + who : subjectBase + who;
      var body = "";
      Object.keys(data).forEach(function (k) {
        if (k !== "message") body += k.charAt(0).toUpperCase() + k.slice(1) + ": " + data[k] + "\n";
      });
      body += "\n" + (data.message || "") + "\n";
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      if (status) status.textContent = "Opening your email app… if nothing happens, email " + to + " directly.";
    });
  });
})();
