'use strict';

function $all(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function windowWidth() {
  return document.documentElement.clientWidth;
}

// Run fn at most once per animation frame, for scroll / resize listeners
function onFrame(fn) {
  var pending = false;
  return function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () { pending = false; fn(); });
  };
}

// jQuery-like slideUp / slideDown (animates height, vertical paddings & margins)
var SLIDE_PROPS = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"];

function isShown(el) {
  return el.style.display !== "none";
}

function slide(el, show, duration, done) {
  var running = el._slide;
  if (running) {
    running.cancel();
    el._slide = null;
    el.style.overflow = "";
  }
  if (!running && show === isShown(el)) { if (done) done(); return; }

  el.style.display = "";
  var style = window.getComputedStyle(el);
  var full = {}, empty = {};
  SLIDE_PROPS.forEach(function (prop) {
    full[prop] = prop === "height" ? el.getBoundingClientRect().height + "px" : style[prop];
    empty[prop] = "0px";
  });

  el.style.overflow = "hidden";
  var anim = el.animate(show ? [empty, full] : [full, empty], { duration: duration, easing: "ease-in-out", fill: "forwards" });
  // finished with a timer (as jQuery did) rather than the animation's finish event
  var timer = window.setTimeout(function () {
    el._slide = null;
    el.style.overflow = "";
    if (!show) el.style.display = "none";
    anim.cancel();
    if (done) done();
  }, duration);
  el._slide = { cancel: function () { window.clearTimeout(timer); anim.cancel(); } };
}

var ExperiencesModel = {
  filters : {},

  initData: function () {
    this.data = $all(".cd-timeline-block").map(function (block) {
      return {
        id: block.id,
        type: block.getAttribute("data-type"),
        tags: block.getAttribute("data-tags").split(","),
      };
    });
  },

  updateFilters: function () {
    var that = this;

    that.filters = {};

    $all("#timeline-controls li").forEach(function (el) {
      var dim = el.getAttribute("data-dim");

      if (that.filters[dim] == undefined)
        that.filters[dim] = [];

      if (el.classList.contains("active"))
        that.filters[dim].push(el.getAttribute("data-filter"));
    });
  },

  matchFilter: function (d, filter) {
    if (typeof d[filter] == "undefined") {
      return true;
    }
    if (typeof d[filter] == "string") {
      if (d[filter] == "")
        return true;
      else
        return (this.filters[filter].indexOf(d[filter]) >= 0);
    }
    else {
      if (d[filter].length == 0) {
        return true;
      }
      for (var i = 0; i < d[filter].length; i++) {
        if (this.filters[filter].indexOf(d[filter][i]) >= 0)
          return true;
      }
      return false;
    }
  },

  matchFilters: function (d) {
    for(var key in this.filters) {
      if (!this.matchFilter(d, key))
        return false;
    }
    return true;
  },

  getStates: function () {
    var out = {}
    for(var i = 0; i < this.data.length; i++) {
      out[this.data[i].id] = this.matchFilters(this.data[i]);
    }
    return out;
  },

  updateDisplay: function () {
    this.updateFilters();
    var states = this.getStates();
    for (var expId in states) {
      var block = document.getElementById(expId);
      if (states[expId] == false)
        block.classList.replace("cd-enter", "cd-leave") || block.classList.add("cd-leave");
      else {
        slide(block, true, 500);
        block.classList.replace("cd-leave", "cd-enter") || block.classList.add("cd-enter");
      }
    }

    window.setTimeout(function() {
      $all(".cd-timeline-block.cd-leave").forEach(function (block) {
        slide(block, false, 500);
      });
    }, 100);
  }
}

// TOOLTIPS: Bootstrap-like markup (data-toggle="tooltip", title, data-placement)
function initTooltips() {
  $all('[data-toggle="tooltip"]').forEach(function (el) {
    var tip = null;
    var title = el.getAttribute("title");
    el.removeAttribute("title");
    if (!el.textContent.trim()) {
      el.setAttribute("role", "img"); // aria-label is not allowed on a role-less <i>
      el.setAttribute("aria-label", title);
    }

    function show() {
      if (tip) return;
      var placement = el.getAttribute("data-placement") === "bottom" ? "bottom" : "top";
      tip = document.createElement("div");
      tip.className = "tooltip " + placement;
      tip.setAttribute("role", "tooltip");
      tip.innerHTML = '<div class="tooltip-arrow"></div><div class="tooltip-inner"></div>';
      tip.querySelector(".tooltip-inner").textContent = title;
      document.body.appendChild(tip);

      var rect = el.getBoundingClientRect();
      var left = rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2;
      var top = placement === "bottom" ? rect.bottom + window.scrollY : rect.top + window.scrollY - tip.offsetHeight;
      tip.style.left = Math.max(0, left) + "px";
      tip.style.top = top + "px";
      tip.getBoundingClientRect(); // force layout so the fade-in transition runs
      tip.classList.add("in");
    }

    function hide() {
      if (!tip) return;
      tip.remove();
      tip = null;
    }

    el.addEventListener("mouseenter", show);
    el.addEventListener("focus", show);
    el.addEventListener("mouseleave", hide);
    el.addEventListener("blur", hide);
  });
}

// COLLAPSE: navbar toggle & BibTex blocks (data-toggle="collapse" data-target="...")
function initCollapse() {
  $all('[data-toggle="collapse"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var target = btn.getAttribute("data-target");
      var targets = target.charAt(0) === "#" ? [document.getElementById(target.slice(1))] : $all(target);

      targets.forEach(function (el) {
        // el._open: target state, "in" is only removed once the closing animation is over
        var open = el._open === undefined ? !el.classList.contains("in") : !el._open;
        el._open = open;
        btn.setAttribute("aria-expanded", open);
        if (open) {
          if (!el.classList.contains("in")) {
            el.style.display = "none";
            el.classList.add("in");
          }
          slide(el, true, 350, function () { el.style.display = ""; });
        } else {
          slide(el, false, 350, function () {
            el.classList.remove("in");
            el.style.display = "";
          });
        }
      });
    });
  });
}

// DROPDOWNS: data-toggle="dropdown", closed by any other click or Escape
function initDropdowns() {
  var toggles = $all('[data-toggle="dropdown"]');

  function closeAll(except) {
    toggles.forEach(function (toggle) {
      if (toggle === except) return;
      toggle.parentNode.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      closeAll(toggle);
      var open = toggle.parentNode.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest('[data-toggle="dropdown"]')) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });
}

// SCROLLSPY: highlight the navbar link of the one-page block being read
function initScrollspy() {
  var items = $all('#header .nav li > a[href^="#"]').map(function (link) {
    var id = link.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (e) {}
    return { li: link.parentNode, target: document.getElementById(id) };
  }).filter(function (item) { return item.target; });

  if (!items.length) return;

  var offset = 10;

  function activate(active) {
    items.forEach(function (item) {
      item.li.classList.toggle("active", item === active);
    });
  }

  function update() {
    var scrollTop = window.scrollY + offset;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var top = function (item) { return item.target.getBoundingClientRect().top + window.scrollY; };

    if (window.scrollY >= maxScroll) return activate(items[items.length - 1]);
    if (scrollTop < top(items[0])) return activate(null);

    var current = items[0];
    items.forEach(function (item) {
      if (top(item) <= scrollTop) current = item;
    });
    activate(current);
  }

  window.addEventListener("scroll", onFrame(update), { passive: true });
  window.addEventListener("resize", onFrame(update));
  update();
}

// PARALLAX: the background moves at half the scrolling speed (on top of
// background-attachment: fixed), as the former jQuery Parallax plugin did
function initParallax() {
  if (windowWidth() < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var blocks = $all(".parallax").map(function (el) {
    return { el: el, firstTop: el.getBoundingClientRect().top + window.scrollY };
  });

  function update() {
    var pos = window.scrollY;
    var windowHeight = window.innerHeight;
    blocks.forEach(function (block) {
      var top = block.el.getBoundingClientRect().top + pos;
      // skip blocks totally above or below the viewport
      if (top + block.el.offsetHeight < pos || top > pos + windowHeight) return;
      block.el.style.backgroundPosition = "50% " + Math.round((block.firstTop - pos) * 0.5) + "px";
    });
  }

  window.addEventListener("scroll", onFrame(update), { passive: true });
  window.addEventListener("resize", onFrame(update));
  update();
}

// TRIANGLIFY: random (but seeded by the URL) triangles header background
function initTrianglify() {
  var header = document.querySelector(".trianglify");
  var background = document.querySelector(".trianglify .background");
  if (!header || !background) return;

  // content box size, as jQuery's .width() / .height() returned
  var style = window.getComputedStyle(header);
  var height = header.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  var width = header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

  var pattern = Trianglify({
    height: height+250,
    width: width+150,
    variance: 0.5,
    seed: window.location.href,
    cell_size: 60});

  background.appendChild(pattern.canvas());
}

// REVEAL TIMELINE: blocks below the fold bounce in when scrolled to
function initTimelineReveal() {
  var blocks = $all(".cd-timeline-reveal .cd-timeline-block");
  if (!blocks.length) return;

  var limit = function () { return window.scrollY + window.innerHeight * 0.75; };
  var top = function (block) { return block.getBoundingClientRect().top + window.scrollY; };
  var parts = function (block) { return $all(".cd-timeline-img, .cd-timeline-content", block); };

  //hide timeline blocks which are outside the viewport
  blocks.forEach(function (block) {
    if (top(block) > limit()) {
      parts(block).forEach(function (el) { el.classList.add("is-hidden"); });
    }
  });

  //on scolling, show/animate timeline blocks when enter the viewport
  window.addEventListener("scroll", onFrame(function () {
    blocks.forEach(function (block) {
      var img = block.querySelector(".cd-timeline-img");
      if (top(block) <= limit() && img.classList.contains("is-hidden")) {
        parts(block).forEach(function (el) {
          el.classList.remove("is-hidden");
          el.classList.add("bounce-in");
        });
      }
    });
  }), { passive: true });
}

// TIMELINE CONTROLS: filter experiences by type & tags
function initTimelineControls() {
  if (!document.getElementById("timeline-controls")) return;

  ExperiencesModel.initData();

  $all("#timeline-controls .show-all").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      $all("#timeline-controls li").forEach(function (li) { li.classList.add("active"); });
      ExperiencesModel.updateDisplay();
    });
  });

  $all("#timeline-controls li span").forEach(function (span) {
    span.addEventListener("click", function (e) {
      e.preventDefault();
      var parent = span.parentNode;
      var siblings = $all('#timeline-controls li[data-dim="' + parent.getAttribute("data-dim") + '"]');

      // filter unique
      if (span.classList.contains("keyword")) {
        var activeCount = siblings.filter(function (li) { return li.classList.contains("active"); }).length;

        // activate all if only me currently
        if (activeCount == 1 && parent.classList.contains("active")) {
          siblings.forEach(function (li) { li.classList.add("active"); });
        }
        // activate me else
        else {
          siblings.forEach(function (li) { li.classList.remove("active"); });
          parent.classList.add("active");
        }
      }

      // filter toggle
      else
        parent.classList.toggle("active");

      // update display
      ExperiencesModel.updateDisplay();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initTooltips();
  initCollapse();
  initDropdowns();

  // EMAIL SHOW BUTTON: reveal the address on first click, then act as a mailto link
  $all(".contact-show-email").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var mail = JSON.parse(el.querySelector(".hidden").textContent);

      mail = mail.reverse().join("").replace(/\|/g, ".").replace(/!/g, "@");
      el.setAttribute("href", "mailto:" + mail);
      el.querySelector("button").replaceWith(mail);
    }, { once: true });
  });

  // HEADER BRAND: "TR" at the top of the page, full name once scrolled
  function updateBrand() { document.body.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", updateBrand, { passive: true });
  updateBrand();

  // ANCHOR CLICKS are smooth-scrolled by CSS (scroll-behavior in _base.scss)

  initScrollspy();
  initParallax();
  initTrianglify();
  initTimelineReveal();
  initTimelineControls();
});
