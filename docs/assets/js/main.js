'use strict';

var ExperiencesModel = {
  filters : {},

  initData: function () {
    var data = $(".cd-timeline-block");
    this.data = [];
    for (var i = 0; i < data.length; i++) {
      this.data.push({
        id: data[i].id,
        type: $(data[i]).data("type"),
        tags: $(data[i]).data("tags").split(","),
      });
    }
  },

  updateFilters: function () {
    var that = this;

    that.filters = {};

    jQuery("#timeline-controls li").each(function (){
      var el = jQuery(this);
      var dim = el.attr("data-dim");
      
      if (that.filters[dim] == undefined)
        that.filters[dim] = [];

      if (el.hasClass("active"))
        that.filters[dim].push(el.attr("data-filter"));
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
      if (states[expId] == false)
        jQuery("#"+expId).removeClass("cd-enter").addClass("cd-leave");
      else {
        jQuery("#"+expId).slideDown(500);
        jQuery("#"+expId).addClass("cd-enter").removeClass("cd-leave");
      }
    }

    window.setTimeout(function() {
      jQuery(".cd-timeline-block.cd-leave").each(function() {
        jQuery(this).slideUp(500);
      });
    }, 100);
  }
}

$(document).ready(function () {
  // ENABLE TOOLTIPS
  $('[data-toggle="tooltip"]').tooltip({container: "body"});

  // EMAIL SHOW BUTTON
  $('.contact-show-email').click(function() {
    var el = $(this);
    var btn = el.find('button');
    var mail = JSON.parse(el.find('.hidden').html());

    mail = mail.reverse().join("").replace(/\|/g, ".").replace(/!/g, "@");
    el.attr("href", "mailto:"+mail)
    btn.replaceWith(mail);
    el.unbind("click");

    return false;
  });

  // ANIMATE ANCHORS CLICKS
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });

  // PARALLAX SETUP
  if ($(window).width() >= 768) {
    $(".parallax").each(function(_, el) {
      $(el).parallax("50%", 0.5);
    });
  }

  // TRIANGLIFY SETUP
  if ($('.trianglify .background').length) {
    var pattern = Trianglify({
      height: $('.trianglify').height()+250,
      width: $('.trianglify').width()+150,
      variance: 0.5,
      seed: window.location.href,
      cell_size: 60});

    $('.trianglify .background').append(pattern.canvas());
  }

  // PARTICLES SETUP
  if ($('.particles .background').length) {
    $('.particles .background').attr("id", "particles-js");
    particlesJS('particles-js',
      {
        "particles": {
          "number": { "value": $(window).width() / 1440 * 180, "density": { "enable": false, "value_area": 100 } },
          "color": { "value": "#666666" },
          "shape": { "type": "circle", "stroke": { "width": 0, "color": "#666666" }, },
          "opacity": { "value": 0.4, "random": false, "anim": { "enable": false } },
          "size": { "value": 3, "random": true, "anim": { "enable": false } },
          "line_linked": { "enable": true, "distance": 150, "color": "#cccccc", "opacity": 0.35, "width": 1 },
          "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false } }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": { "onhover": { "enable": false }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
          "modes": { "push": { "particles_nb": 2 } }
        },
        "retina_detect": true
      }
    );
  }

  // REVEAL TIMELINE

  var timeline_blocks_reveal = $(".cd-timeline-reveal .cd-timeline-block");
  //hide timeline blocks which are outside the viewport
  timeline_blocks_reveal.each(function(){
    if($(this).offset().top > $(window).scrollTop()+$(window).height()*0.75) {
      $(this).find(".cd-timeline-img, .cd-timeline-content").addClass("is-hidden");
    }
  });

  //on scolling, show/animate timeline blocks when enter the viewport
  $(window).on("scroll", function(){
    timeline_blocks_reveal.each(function(){
      if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75 && $(this).find(".cd-timeline-img").hasClass("is-hidden") ) {
        $(this).find(".cd-timeline-img, .cd-timeline-content").removeClass("is-hidden").addClass("bounce-in");
      }
    });
  });


  ////////////////////////////
  // TIMELINE CONTROL SETUP //
  ////////////////////////////
  if ($("#timeline-controls").length) {

    ExperiencesModel.initData();

    $("#timeline-controls .show-all").click(function() {
      $("#timeline-controls li").addClass("active");
      ExperiencesModel.updateDisplay();
      return false;
    });

    $("#timeline-controls li span").click(function() {
      
      var parent = $(this).parent();

      // filter unique
      if ($(this).hasClass("keyword")) {
        var i = 0;
        $("#timeline-controls li[data-dim=" + parent.attr("data-dim") + "]").each(function () {
          if ($(this).hasClass("active")) i++;
        });

        // activate all if only me currently
        if (i == 1 && parent.hasClass("active")) {
          $("#timeline-controls li[data-dim=" + parent.attr("data-dim") + "]").addClass("active");
        }
        // activate me else
        else {
          $("#timeline-controls li[data-dim=" + parent.attr("data-dim") + "]").removeClass("active");
          parent.addClass("active");
        }
      }

      // filter toggle
      else
        parent.toggleClass("active");

      // update display
      ExperiencesModel.updateDisplay();

      return false;
    });
  }


});
