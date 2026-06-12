/* Stephan Botes — Security Engineering · interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      mnav.hidden = false;
      mnav.dataset.open = String(open);
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        mnav.dataset.open = "false";
        toggle.setAttribute("aria-expanded", "false");
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
        e.target.style.transitionDelay = Math.min(i * 70, 420) + "ms";
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
