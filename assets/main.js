/* Cyber Sec — Enterprise Cybersecurity · interactions */
(function () {
  "use strict";

  /* ── origin guard: flag & neutralise rehosted / fraudulent copies ── */
  (function () {
    try {
      var official = ["cybersec.org.za", "www.cybersec.org.za"];
      var h = location.hostname;
      var dev = h === "localhost" || h === "127.0.0.1" || h === "" || /\.local$/.test(h);
      if (dev || official.indexOf(h) !== -1) return;
      var warn = function () {
        var bar = document.createElement("div");
        bar.setAttribute("role", "alert");
        bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;" +
          "background:#7a0010;color:#fff;font:600 14px/1.5 system-ui,-apple-system,sans-serif;" +
          "padding:12px 16px;text-align:center;box-shadow:0 2px 20px rgba(0,0,0,.55)";
        bar.innerHTML = "\u26A0 You are viewing an unofficial copy of this website. " +
          "The official Cyber Sec site is <a href=\"https://cybersec.org.za/\" " +
          "style=\"color:#fff;text-decoration:underline\">cybersec.org.za</a> \u2014 " +
          "do not enter any personal information here.";
        (document.body || document.documentElement).appendChild(bar);
        /* Neutralise any forms a phishing clone may have copied verbatim. */
        var forms = document.querySelectorAll("form");
        for (var i = 0; i < forms.length; i++) {
          forms[i].addEventListener("submit", function (e) {
            e.preventDefault(); e.stopPropagation();
          }, true);
        }
        /* Send visitors on to the genuine site. */
        setTimeout(function () { location.replace("https://cybersec.org.za/"); }, 6000);
      };
      if (document.body) warn();
      else document.addEventListener("DOMContentLoaded", warn);
    } catch (e) {}
  })();

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = motionQuery.matches;

  /* Re-render on OS motion-preference change instead of latching the value at load. */
  var onMotionChange = function () { window.location.reload(); };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

  /* Backing-store scale. Capped so a 3x phone doesn't render a 3x full-screen canvas. */
  function dpr(cap) {
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  /* Size a canvas for the current device pixel ratio and return the scale applied.
     cssW/cssH are logical pixels; all drawing code keeps using logical coordinates. */
  function fitCanvas(canvas, ctx, cssW, cssH, cap) {
    var ratio = dpr(cap);
    canvas.width = Math.round(cssW * ratio);
    canvas.height = Math.round(cssH * ratio);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return ratio;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* Devices that should not pay for the decorative animation.
     Measured on a 6x-throttled 390x844 phone: the two canvas loops dragged scrolling
     from ~60fps to ~14. The full-screen background is skipped outright here and the
     globe is drawn once instead of animated, which costs a single frame. */
  var lite = (function () {
    try {
      if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024) return true;
      if ((navigator.hardwareConcurrency || 8) <= 4) return true;
    } catch (e) {}
    return false;
  })();

  /* ── rotating wireframe earth globe ── */
  (function () {
    var canvas = document.getElementById("globe-canvas");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var SIZE = 60;
    var R = 26, cx = 30, cy = 30;
    var angle = 0;
    var latLines = 7, lonLines = 10;

    fitCanvas(canvas, ctx, SIZE, SIZE, 2);
    window.addEventListener("resize", debounce(function () {
      fitCanvas(canvas, ctx, SIZE, SIZE, 2);
    }, 150));

    function drawGlobe() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.strokeStyle = "rgba(30,128,255,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      var i, j, lat, lon, first, x, y, z, phi;
      for (i = 1; i < latLines; i++) {
        lat = -90 + (180 * i / latLines);
        ctx.beginPath();
        first = true;
        for (j = 0; j <= 360; j += 3) {
          lon = (j + angle) * Math.PI / 180;
          phi = (90 - lat) * Math.PI / 180;
          x = R * Math.sin(phi) * Math.cos(lon);
          y = R * Math.cos(phi);
          z = R * Math.sin(phi) * Math.sin(lon);
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
        first = true;
        for (j = -90; j <= 90; j += 3) {
          lat = j * Math.PI / 180;
          x = R * Math.cos(lat) * Math.cos(lon);
          y = R * Math.sin(lat);
          z = R * Math.cos(lat) * Math.sin(lon);
          /* Cull the far side, same as the latitude rings — otherwise front and back
             meridians draw at equal weight and the sphere reads as a flat mesh. */
          if (z > -R * 0.15) {
            if (first) { ctx.moveTo(cx + x, cy - y); first = false; }
            else ctx.lineTo(cx + x, cy - y);
          } else { first = true; }
        }
        ctx.strokeStyle = "rgba(30,128,255,0.35)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      angle = (angle + 0.35) % 360;
      if (!lite) requestAnimationFrame(drawGlobe);
    }
    /* On a lite device this paints one static wireframe sphere and stops. */
    drawGlobe();
  })();

  /* ── background wave + wireframe + grid sweep ── */
  (function () {
    var canvas = document.getElementById("bg-canvas");
    if (!canvas || reduce || lite) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, time = 0;
    var gridSweep = { active: false, startT: 0, duration: 4000 };
    var nodes = [];

    function seedNodes() {
      nodes = [];
      for (var n = 0; n < 18; n++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: 1 + Math.random() * 2.5
        });
      }
    }

    function resize() {
      var prevW = W, prevH = H;
      W = window.innerWidth;
      H = window.innerHeight;
      fitCanvas(canvas, ctx, W, H, 1.5);
      /* Keep the existing nodes and rescale them. Re-seeding on every resize made the
         field jump each time a mobile browser showed or hid its address bar. */
      if (!nodes.length || !prevW || !prevH) seedNodes();
      else {
        var sx = W / prevW, sy = H / prevH;
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].x *= sx;
          nodes[i].y *= sy;
        }
      }
    }
    /* Debounced: resize fires continuously during a drag, and each call reallocates
       the canvas backing store. */
    window.addEventListener("resize", debounce(resize, 150));
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
      ctx.beginPath();
      for (x = 0; x < W; x += size) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (y = 0; y < H; y += size) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
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
        if (n.x < 0) n.x = W; else if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; else if (n.y > H) n.y = 0;

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

      for (var p = 0; p < 50; p++) {
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
    var setNav = function (open) {
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mnav.dataset.open = String(open);
      /* Keep `hidden` in step with the visual state. Previously it was cleared on every
         toggle, which left the closed menu exposed to screen readers and keyboard tabbing. */
      mnav.hidden = !open;
    };

    toggle.addEventListener("click", function () {
      setNav(mnav.hidden);
    });

    Array.prototype.forEach.call(mnav.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });

    /* Escape closes and returns focus to the toggle. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mnav.hidden) {
        setNav(false);
        toggle.focus();
      }
    });

    /* Click outside closes. */
    document.addEventListener("click", function (e) {
      if (mnav.hidden) return;
      if (mnav.contains(e.target) || toggle.contains(e.target)) return;
      setNav(false);
    });

    /* Crossing the desktop breakpoint hides .mobile-nav via CSS but used to leave the
       header in its `open` state, so the hamburger stayed as an X after rotating. */
    var wide = window.matchMedia("(min-width: 901px)");   /* matches styles.css */
    var onWide = function (e) { if (e.matches && !mnav.hidden) setNav(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);

    setNav(false);
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

  /* ── indicative price localisation (store page only) ──
     Region comes from the browser's own IANA time zone. No geo-IP lookup: that would
     mean shipping every visitor's address to a third party, which is exactly the kind
     of finding this site sells audits for, and it would need a CSP exception too.
     Time zone is approximate — a VPN or a traveller reads wrong — so the picker below
     is the real answer and the guess is only the default. */
  (function () {
    var amounts = document.querySelectorAll(".amt[data-usd]");
    if (!amounts.length) return;

    var RATES = (window.CS_RATES && window.CS_RATES.rates) || null;
    if (!RATES) return;                       // rates.js missing — leave the USD markup alone

    var ZONE_CCY = {
      "Africa/Johannesburg": "ZAR", "Africa/Windhoek": "ZAR", "Africa/Maseru": "ZAR", "Africa/Mbabane": "ZAR",
      "Europe/London": "GBP", "Europe/Belfast": "GBP", "Europe/Zurich": "CHF",
      "Asia/Dubai": "AED", "Asia/Singapore": "SGD",
      "Asia/Kolkata": "INR", "Asia/Calcutta": "INR",
      "Pacific/Auckland": "NZD"
    };
    var EURO = ["Dublin","Paris","Berlin","Madrid","Rome","Amsterdam","Brussels","Vienna","Lisbon",
                "Helsinki","Athens","Ljubljana","Bratislava","Tallinn","Riga","Vilnius","Luxembourg",
                "Malta","Nicosia","Zagreb","Podgorica","Andorra","Monaco","San_Marino","Vatican"];
    var CAD_ZONES = ["Toronto","Vancouver","Edmonton","Winnipeg","Halifax","St_Johns","Regina","Montreal","Whitehorse","Yellowknife"];

    function guess() {
      var tz = "";
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
      if (ZONE_CCY[tz]) return ZONE_CCY[tz];
      if (tz.indexOf("Australia/") === 0) return "AUD";
      var city = tz.split("/")[1] || "";
      if (tz.indexOf("Europe/") === 0 && EURO.indexOf(city) > -1) return "EUR";
      if (tz.indexOf("America/") === 0 && CAD_ZONES.indexOf(city) > -1) return "CAD";
      /* Last resort: the locale's region, e.g. en-ZA. Less reliable than the zone —
         plenty of people run a US-English browser outside the US. */
      var region = (navigator.language || "").split("-")[1];
      var BY_REGION = { ZA:"ZAR", GB:"GBP", IE:"EUR", DE:"EUR", FR:"EUR", ES:"EUR", IT:"EUR", NL:"EUR",
                        AU:"AUD", NZ:"NZD", CA:"CAD", CH:"CHF", AE:"AED", SG:"SGD", IN:"INR" };
      return (region && BY_REGION[region]) || "USD";
    }

    /* Converted figures are estimates, so present them as estimates — a price like
       "R8,227" implies a precision the exchange rate does not have. */
    function tidy(v) {
      var step = v < 1000 ? 10 : v < 10000 ? 50 : v < 100000 ? 500 : 1000;
      return Math.ceil(v / step) * step;       // round up: these are "from" prices
    }

    function fmt(v, ccy, display) {
      return new Intl.NumberFormat(navigator.language || "en", {
        style: "currency", currency: ccy, currencyDisplay: display,
        minimumFractionDigits: 0, maximumFractionDigits: 0
      }).format(v);
    }

    function money(v, ccy) {
      try {
        var out = fmt(v, ccy, "narrowSymbol");
        /* AUD, CAD, NZD and SGD all narrow to a bare "$", so an Australian would read
           "$710" as US dollars on a page whose list price genuinely is USD. Fall back
           to the ISO code whenever the symbol is an unqualified dollar sign. */
        if (ccy !== "USD" && out.indexOf("$") > -1) out = fmt(v, ccy, "code");
        return out;
      } catch (e) {
        try { return fmt(v, ccy, "code"); }
        catch (e2) { return ccy + " " + v.toLocaleString("en"); }
      }
    }

    var note = document.getElementById("ccy-note");
    /* persist only on an explicit pick. Storing the auto-detected guess too would
       freeze the first guess forever — a visitor who travels, or whose zone was
       misread once, would keep seeing the wrong currency with no way to re-detect. */
    function render(ccy, persist) {
      var rate = RATES[ccy];
      if (!rate) { ccy = "USD"; rate = 1; }
      Array.prototype.forEach.call(amounts, function (el) {
        var usd = parseFloat(el.getAttribute("data-usd"));
        if (ccy === "USD") {
          el.textContent = "from " + money(usd, "USD");
          el.removeAttribute("title");
        } else {
          el.textContent = "≈ " + money(tidy(usd * rate), ccy);
          el.setAttribute("title", "Indicative. List price is USD " + usd.toLocaleString("en") + ".");
        }
      });
      if (note) {
        note.textContent = ccy === "USD"
          ? "Prices in US dollars. Every engagement is quoted and invoiced in USD."
          : "Indicative conversion at " + (window.CS_RATES.updated || "recent") +
            " rates, rounded up. Quoted and invoiced in USD.";
      }
      if (persist) { try { localStorage.setItem("cs-ccy", ccy); } catch (e) {} }
    }

    var saved = null;
    try { saved = localStorage.getItem("cs-ccy"); } catch (e) {}
    var initial = (saved && RATES[saved]) ? saved : guess();

    var sel = document.getElementById("ccy-select");
    if (sel) {
      Object.keys(RATES).forEach(function (c) {
        var o = document.createElement("option");
        o.value = c; o.textContent = c;
        sel.appendChild(o);
      });
      sel.value = initial;
      sel.addEventListener("change", function () { render(sel.value, true); });
    }
    render(initial, false);
  })();

  /* forms — mailto compose by default; Formspree/Web3Forms if data-endpoint set.
     Works for any <form data-mailto="addr" data-subject="…"> (contact + facts). */

  /* Anything past this and the mailto: URL starts getting truncated by mail clients
     and by Windows' ~2048-character shell limit. */
  var MAILTO_BODY_LIMIT = 1500;

  var forms = document.querySelectorAll("form[data-mailto]");
  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector(".form-status");
    var to = form.getAttribute("data-mailto") || "stephanbotesIT@proton.me";
    var subjectBase = form.getAttribute("data-subject") || "Website enquiry";

    /* Honeypot: a real person never fills this in, a scraper bot fills everything.
       Hidden from sight, from screen readers, and from autofill. */
    var pot = document.createElement("div");
    pot.setAttribute("aria-hidden", "true");
    pot.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden";
    pot.innerHTML = '<label>Leave this field empty' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(pot);

    function collect() {
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === "submit" || el.type === "button") return;
        /* An unchecked box used to be submitted with its value anyway, so a form
           could report consent that was never given. */
        if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;
        data[el.name] = (el.value || "").trim();
      });
      return data;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.reportValidity()) return;

      var data = collect();
      if (data.website) return;          // honeypot tripped — drop it silently
      delete data.website;

      var endpoint = (form.getAttribute("data-endpoint") || "").trim();

      if (endpoint) {
        if (status) status.textContent = "Sending…";
        /* Without a timeout a hung endpoint leaves "Sending…" on screen forever
           with no way for the visitor to know it failed. */
        var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;

        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: ctrl ? ctrl.signal : undefined
        }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          if (status) status.textContent = "Sent — I'll be in touch shortly.";
        }).catch(function () {
          if (status) status.textContent = "Couldn't send. Email " + to + " directly.";
        }).then(function () {
          if (timer) clearTimeout(timer);
        });
        return;
      }

      /* default: open the visitor's mail client with a prefilled message */
      var who = data.name ? " (" + data.name + ")" : "";
      var subject = data.engagement ? subjectBase + " — " + data.engagement + who : subjectBase + who;
      var body = "";
      Object.keys(data).forEach(function (k) {
        if (k !== "message") body += k.charAt(0).toUpperCase() + k.slice(1) + ": " + data[k] + "\n";
      });
      body += "\n" + (data.message || "") + "\n";

      var truncated = body.length > MAILTO_BODY_LIMIT;
      if (truncated) body = body.slice(0, MAILTO_BODY_LIMIT) + "\n\n[…message truncated — please paste the rest]";

      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent = truncated
          ? "Opening your email app — your message was long, so please check nothing was cut off before sending."
          : "Opening your email app… if nothing happens, email " + to + " directly.";
      }
    });
  });
})();
