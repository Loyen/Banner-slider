(function(window){
  'use strict';

  function sliderDefinition(){

    var slider = function(slideIdentifier){
      this._construct(slideIdentifier);
    };

    slider.prototype.options = {
      classes: {
        navigation: '.slider-nav',
        slide: '.slide'
      },
      animation: {
        pause: 2000,
        duration: 1000,
        transition: 'slideInRight',
        easing: 'easeInOutExpo'
      },
      random: false
    };

    slider.prototype.data = {
      currentSlide: null,
      lastSlide: null,
      slides: [],
      animation: { run: null }
    };

    slider.prototype._construct = function(slideIdentifier){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slider = document.body.querySelector(slideIdentifier),
        slides = slider.querySelectorAll(self.options.classes.slide);

      data.slider = slider;
      data.slides = slides;

      self._initiate();
    };

    /**
     * Initiate slider
     */
    slider.prototype._initiate = function(){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides;

      for (var i = 0; i < slides.length; i++)
      {
        slides[i].style.display = 'none';
        slides[i].style.zIndex = 0;
      }

      // Set current slide
      data.currentSlide = (options.random ? self.randomSlide() : 0);

      self.newSlide(data.currentSlide, true);
      self.start();
    };

    /**
     * Start slider
     */
    slider.prototype.start = function(){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides;

      data.animation.run = setInterval(function(){
        var 
          currentSlideID = data.currentSlide,
          slideID = (options.random ? self.randomSlide() : currentSlideID+1);

        if (slideID >= slides.length) slideID = 0;
        
        self.newSlide(slideID);
      }, options.animation.pause);
    };

    /**
     * Stop slider
     */
    slider.prototype.stop = function(){
      var 
        self = this,
        options = self.options,
        data = self.data;

      clearInterval(data.animation.run);
    };

    /**
     * Transition to next slide with/without animation
     */
    slider.prototype.newSlide = function(slideID, noAnimation){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides,
        lastSlideID = data.lastSlide,
        lastSlide = slides[lastSlideID],
        currentSlideID = data.currentSlide,
        currentSlide = slides[currentSlideID],
        transition = options.animation.transition,
        easing = options.animation.easing;

      if (!slides[slideID]) {
        console.log('Slide '+slideID+' do not exist.');
      } else {
        currentSlide = slides[slideID];
        data.currentSlide = slideID;

        currentSlide.style.left = 'auto';
        currentSlide.style.top = 'auto';
        currentSlide.style.bottom = 'auto';
        currentSlide.style.right = 'auto';

        currentSlide.style.display = 'block';
        currentSlide.style.zIndex = 1;

        if (currentSlide.getAttribute('slider-transition')) transition = currentSlide.getAttribute('slider-transition');
        if (currentSlide.getAttribute('slider-easing')) easing = currentSlide.getAttribute('slider-easing');

        if (lastSlide) lastSlide.style.zIndex = 0;

        // If noAnimation is not set, run transition for current slide
        if (!noAnimation) {
          self.stop(); 

          var runTransition = self.transition(transition, easing);

          runTransition();

          self.start();
        }

        // Remove old slide if any
        if (lastSlide) {
          setTimeout(function(){ lastSlide.style.display = 'none'; }, options.animation.duration);
        }

        data.lastSlide = data.currentSlide;
      }
    };

    slider.prototype.randomSlide = function(){
      var 
        self = this,
        data = self.data,
        slides = data.slides,
        slideID = data.currentSlide;

        while (slideID == data.currentSlide)
        {
          slideID = Math.floor(Math.random() * ((slides.length-1) - 0 + 1)) + 0;
        }
        
        return slideID;
    };

    slider.prototype.click = function(item, e){
    };

    slider.prototype.transition = function(transition, easing){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides,
        lastSlideID = data.lastSlide,
        lastSlide = slides[lastSlideID],
        currentSlideID = data.currentSlide,
        currentSlide = slides[currentSlideID],
        sliderWidth = data.slider.offsetWidth,
        sliderHeight = data.slider.offsetHeight,
        transition = transition || options.animation.transition,
        easing = easing || options.animation.easing,
        tweenFunction = self._tween(easing);

      if (transition == 'slideInVertical') {
        transition = (currentSlideID > lastSlideID ? 'slideInTop' : 'slideInBottom');
      } else if (transition == 'slideInVerticalReversed') {
        transition = (currentSlideID < lastSlideID ? 'slideInTop' : 'slideInBottom');
      } else if (transition == 'slideInHorizontal') {
        transition = (currentSlideID > lastSlideID ? 'slideInRight' : 'slideInLeft');
      } else if (transition == 'slideInHorizontalReversed') {
        transition = (currentSlideID < lastSlideID ? 'slideInRight' : 'slideInLeft');
      }

      return {
        fadeIn: function(){
          currentSlide.style.opacity = 0;

          self.animate({
            run: function(duration, timePassed){
              var newOpacity = tweenFunction(timePassed, 0, 1, duration);
              if (newOpacity >= 1) newOpacity = 1;
              currentSlide.style.opacity = newOpacity;
            },
            complete: function(){ currentSlide.style.opacity = 1; }
          });
        },
        slideInTop: function(){
          currentSlide.style.top = '-'+sliderWidth+'px';
          var offsetTop = currentSlide.offsetTop;

          self.animate({
            run: function(duration, timePassed){
              var newOffset = offsetTop-tweenFunction(timePassed, 0, offsetTop, duration)+'px';
              if (newOffset >= sliderHeight) newOffset = sliderHeight;
              currentSlide.style.top = newOffset;
            },
            complete: function(){ currentSlide.style.top = 0; }
          });
        },
        slideInRight: function(){
          currentSlide.style.right = sliderWidth+'px';
          var offsetLeft = currentSlide.offsetLeft;

          self.animate({
            run: function(duration, timePassed){
              var newOffset = offsetLeft-tweenFunction(timePassed, 0, offsetLeft, duration)+'px';
              if (newOffset >= sliderWidth) newOffset = sliderWidth;
              currentSlide.style.right = newOffset;
            },
            complete: function(){ currentSlide.style.right = 0; }
          });
        },
        slideInBottom: function(){
          currentSlide.style.bottom = sliderWidth+'px';
          var offsetTop = currentSlide.offsetTop;

          self.animate({
            run: function(duration, timePassed){
              var newOffset = offsetTop-tweenFunction(timePassed, 0, offsetTop, duration)+'px';
              if (newOffset >= sliderHeight) newOffset = sliderHeight;
              currentSlide.style.bottom = newOffset;
            },
            complete: function(){ currentSlide.style.bottom = 0; }
          });
        },
        slideInLeft: function(){
          currentSlide.style.left = '-'+sliderWidth+'px';
          var offsetLeft = currentSlide.offsetLeft;

          self.animate({
            run: function(duration, timePassed){
              var newOffset = offsetLeft-tweenFunction(timePassed, 0, offsetLeft, duration)+'px';
              if (newOffset >= sliderWidth) newOffset = sliderWidth;
              currentSlide.style.left = newOffset;
            },
            complete: function(){ currentSlide.style.left = 0; }
          });
        }
      }[transition];
    };

    slider.prototype.animate = function(obj){
      var 
        self = this,
        options = self.options,
        duration = obj.duration || options.animation.duration,
        timeStart = new Date().getTime();

      var animate = setInterval(function(){
        var timePassed = new Date().getTime() - timeStart;

        if (timePassed >= duration) timePassed = duration;

        // Run animation, log if none set
        if (obj.run) obj.run(duration, timePassed);

        if (timePassed >= duration){
          clearInterval(animate);

          // Do complete function 
          if (obj.complete) obj.complete();

          console.log('Animation complete');
        }
      },0);
    };

    slider.prototype._tween = function(type){
      return {
        /* Credit to Robert Penner @ http://gizma.com/easing */
        // simple linear tweening - no easing, no acceleration
        linear: function (t, b, c, d) {
          return c*t/d + b;
        },
        // quadratic easing in - accelerating from zero velocity
        easeInQuad: function (t, b, c, d) {
          t /= d;
          return c*t*t + b;
        },
        // quadratic easing out - decelerating to zero velocity
        easeOutQuad: function (t, b, c, d) {
          t /= d;
          return -c * t*(t-2) + b;
        },
        // quadratic easing in/out - acceleration until halfway, then deceleration
        easeInOutQuad: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2*t*t + b;
          t--;
          return -c/2 * (t*(t-2) - 1) + b;
        },
        // cubic easing in - accelerating from zero velocity
        easeInCubic: function (t, b, c, d) {
          t /= d;
          return c*t*t*t + b;
        },
        // cubic easing out - decelerating to zero velocity
        easeOutCubic: function (t, b, c, d) {
          t /= d;
          t--;
          return c*(t*t*t + 1) + b;
        },
        // cubic easing in/out - acceleration until halfway, then deceleration
        easeInOutCubic: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2*t*t*t + b;
          t -= 2;
          return c/2*(t*t*t + 2) + b;
        },
        // quartic easing in - accelerating from zero velocity
        easeInQuart: function (t, b, c, d) {
          t /= d;
          return c*t*t*t*t + b;
        },
        // quartic easing out - decelerating to zero velocity
        easeOutQuart: function (t, b, c, d) {
          t /= d;
          t--;
          return -c * (t*t*t*t - 1) + b;
        },
        // quartic easing in/out - acceleration until halfway, then deceleration
        easeInOutQuart: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2*t*t*t*t + b;
          t -= 2;
          return -c/2 * (t*t*t*t - 2) + b;
        },
        // quintic easing in - accelerating from zero velocity
        easeInQuint: function (t, b, c, d) {
          t /= d;
          return c*t*t*t*t*t + b;
        },
        // quintic easing out - decelerating to zero velocity
        easeOutQuint: function (t, b, c, d) {
          t /= d;
          t--;
          return c*(t*t*t*t*t + 1) + b;
        },
        // quintic easing in/out - acceleration until halfway, then deceleration
        easeInOutQuint: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2*t*t*t*t*t + b;
          t -= 2;
          return c/2*(t*t*t*t*t + 2) + b;
        },
        // sinusoidal easing in - accelerating from zero velocity
        easeInSine: function (t, b, c, d) {
          return -c * Math.cos(t/d * (PI/2)) + c + b;
        },
        // sinusoidal easing out - decelerating to zero velocity
        easeOutSine: function (t, b, c, d) {
          return c * Math.sin(t/d * (PI/2)) + b;
        },
        // sinusoidal easing in/out - accelerating until halfway, then decelerating
        easeInOutSine: function (t, b, c, d) {
          return -c/2 * (Math.cos(PI*t/d) - 1) + b;
        },
        // exponential easing in - accelerating from zero velocity
        easeInExpo: function (t, b, c, d) {
          return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
        },
        // exponential easing out - decelerating to zero velocity
        easeOutExpo: function (t, b, c, d) {
          return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
        },
        // exponential easing in/out - accelerating until halfway, then decelerating
        easeInOutExpo: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
          t--;
          return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
        },
        // circular easing in - accelerating from zero velocity
        easeInCirc: function (t, b, c, d) {
          t /= d;
          return -c * (Math.sqrt(1 - t*t) - 1) + b;
        },
        // circular easing out - decelerating to zero velocity
        easeOutCirc: function (t, b, c, d) {
          t /= d;
          t--;
          return c * Math.sqrt(1 - t*t) + b;
        },
        // circular easing in/out - acceleration until halfway, then deceleration
        easeInOutCirc: function (t, b, c, d) {
          t /= d/2;
          if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
          t -= 2;
          return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
        }
      }[type];
    };

    return slider;
  }

  window.slider = sliderDefinition();

})(window);