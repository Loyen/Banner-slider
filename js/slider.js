function slider(slideIdentifier, custom_options){
  /**
   * Available options
   */
  this.options_default = {
    classes: {
      navigation: 'slider-navigation',
      navigationItem: 'slider-navigation-item',
      direction: 'slider-directions',
      directionPrev: 'slider-directions-prev',
      directionNext: 'slider-directions-next',
      slider: 'slider',
      slide: 'slide',
    },
    transition: {
      duration: 800,
      effect: 'slideInHorizontal',
      easing: 'easeInOutExpo'
    },
    pause: 2000,
    autoRun: true,
    random: false,
    direction: true,
    navigation: true
  };

  this.options = {};

  /**
   * Data holder for current instance, do not touch
   */
  this.data = {
    currentSlide: null,
    lastSlide: null,
    slider: null,
    slides: [],
    navigation: null,
    animation: { run: null },
    run: true,
    transition: false
  };

  /**
   * Constructor
   * Initiate what slider container to use and setup basic data
   */
  this._construct = function(slideIdentifier, custom_options){
    var 
      self = this,
      options_default = self.options_default,
      options = (custom_options ? self._merge(options_default, custom_options) : options_default),
      data = self.data,
      sliderWrapper = document.body.querySelector(slideIdentifier),
      slider = sliderWrapper.querySelector('.'+options.classes.slider),
      slides = slider.querySelectorAll('.'+options.classes.slide);
    
    // If there's more than one slide
    if (slides.length > 1) {
      // If directions is set to be shown, add them
      if (options.direction) {
        var 
          direction = document.createElement('div'),
          directionPrev = document.createElement('div'),
          directionNext = document.createElement('div');

        direction.setAttribute('class', options.classes.direction);
        directionPrev.setAttribute('class', options.classes.directionPrev);
        directionNext.setAttribute('class', options.classes.directionNext);

        // Add click event for "previous"
        directionPrev.addEventListener('mouseup', function(){
          var newSlideID;

          newSlideID = data.currentSlide-1;

          if (newSlideID < 0) newSlideID = slides.length-1;

          self.newSlide(newSlideID);
        });

        // Add click event for "next"
        directionNext.addEventListener('mouseup', function(){
          var newSlideID;

          newSlideID = data.currentSlide+1;

          if (newSlideID > slides.length-1) newSlideID = 0;

          self.newSlide(newSlideID);
        });

        direction.appendChild(directionPrev);
        direction.appendChild(directionNext);

        // Append to sliderWrapper
        sliderWrapper.appendChild(direction);
      }

      // If navigation list is set to be shown, add them
      if (options.navigation) {
        var navigation = document.createElement('div');
        navigation.setAttribute('class', options.classes.navigation);

        for (var i=0;i<slides.length;i++) {
          var 
            navItem = document.createElement('div'),
            slide = slides[i];

          navItem.setAttribute('slide', i);
          navItem.setAttribute('class', options.classes.navigationItem);

          if (slide.getAttribute('id'))
            navItem.setAttribute('class', navItem.getAttribute('class')+' '+options.classes.navigationItem+'-'+slide.getAttribute('id'));

          navItem.innerHTML = (slide.getAttribute('slider-name') ? slide.getAttribute('slider-name') : i+1);

          // Add click events
          navItem.addEventListener('mouseup', function(e){
            var navItem = e.target,
                newSlideID = navItem.getAttribute('slide');

            self.newSlide(newSlideID); 
          });

          navigation.appendChild(navItem);
        }

        self.data.navigation = navigation.children;

        // Append to sliderWrapper
        sliderWrapper.appendChild(navigation);
      }
    } else {
      options.navigation = false;
      options.direction = false;
      options.autoRun = false;
    }

    // If auto run is on, add hover events to slider, otherwise set data.run to false
    if (options.autoRun){
      // Add listeners to pause the slider when hovering over item
      slider.addEventListener('mouseover', function(){ self.stop(); self.data.run = false; });
      slider.addEventListener('mouseout', function(){ self.start(); self.data.run = true; });
    }

    self.options = options;

    data.slider = slider;
    data.slides = slides;

    self._initiate();
  };

  /**
   * Initiate slider
   */
  this._initiate = function(){
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
    var newSlideID = (options.random ? self.randomSlide() : 0);

    self.newSlide(newSlideID, true);

    // If auto run, start the slider
    if (options.autoRun) self.start();
    else data.run = false;
  };

  /**
   * Start slider
   */
  this.start = function(){
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
    }, options.pause);
  };

  /**
   * Stop slider
   */
  this.stop = function(){
    var 
      self = this,
      options = self.options,
      data = self.data;

    clearInterval(data.animation.run);
  };

  /**
   * Transition to next slide with/without animation
   */
  this.newSlide = function(slideID, noAnimation){
    var 
      self = this,
      options = self.options,
      data = self.data,
      slides = data.slides,
      lastSlideID = data.lastSlide,
      lastSlide = slides[lastSlideID],
      currentSlideID = data.currentSlide,
      currentSlide = slides[currentSlideID],
      transition = options.transition.effect,
      easing = options.transition.easing;

    // Make sure slideID is an int
    slideID = parseInt(slideID);

    if (!slides[slideID]) {
      console.log('Slide '+slideID+' do not exist.');
    } else if (slideID == currentSlideID) {
      console.log('Slide is already there.');
    } else if (data.transition) {
      console.log('Slider is currently running a transition. You will have to wait.'); 
    } else {
      currentSlideID = slideID;
      currentSlide = slides[currentSlideID];
      data.currentSlide = currentSlideID;

      currentSlide.style.left = 'auto';
      currentSlide.style.top = 'auto';
      currentSlide.style.bottom = 'auto';
      currentSlide.style.right = 'auto';

      currentSlide.style.display = 'block';
      currentSlide.style.zIndex = 1;

      if (currentSlide.getAttribute('slider-transition')) transition = currentSlide.getAttribute('slider-transition');
      if (currentSlide.getAttribute('slider-easing')) easing = currentSlide.getAttribute('slider-easing');

      if (lastSlide) lastSlide.style.zIndex = 0;

      if (options.navigation) {
        var
          navCurrentSlide = data.navigation[currentSlideID], 
          navCurrentSlideClass = navCurrentSlide.getAttribute('class'),
          navLastSlide, 
          navLastSlideClass;

        if (lastSlide) {
          navLastSlide = data.navigation[lastSlideID];

          navLastSlide.setAttribute('class', navLastSlide.getAttribute('class').replace(/\s?active/, ''));
        }

        navCurrentSlide.setAttribute('class', navCurrentSlide.getAttribute('class')+' active');
      }

      // If noAnimation is not set, run transition for current slide
      if (!noAnimation) {
        if (self.data.run) self.stop(); 

        var runTransition = self.transition(transition, easing);

        runTransition();

        if (self.data.run) self.start();
      }

      // Remove old slide if any when animation is done
      if (lastSlide) {
        setTimeout(function(){ lastSlide.style.display = 'none'; }, options.transition.duration);
      }

      data.lastSlide = data.currentSlide;
    }
  };

  /*
   * Get random slide ID
   */
  this.randomSlide = function(){
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

  this.click = function(item, e){
  };

  this.transition = function(transition, easing){
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
      transition = transition || options.transition.effect,
      easing = easing || options.transition.easing,
      tweenFunction = self._tween(easing);

    var transitions = {
      fadeIn: function(){
        currentSlide.style.opacity = 0;

        self.animate(currentSlide, {opacity: 1});
      },
      slideInTop: function(){
        currentSlide.style.bottom = sliderHeight+'px';

        self.animate(currentSlide, {bottom: 0});
      },
      slideInRight: function(){
        currentSlide.style.left = sliderWidth+'px';

        self.animate(currentSlide, {left: 0});
      },
      slideInBottom: function(){
        currentSlide.style.top = sliderHeight+'px';

        self.animate(currentSlide, {top: 0});
      },
      slideInLeft: function(){
        currentSlide.style.right = sliderWidth+'px';

        self.animate(currentSlide, {right: 0});
      },
      slideInTopLeft: function(){
        currentSlide.style.bottom = sliderHeight+'px';
        currentSlide.style.right = sliderWidth+'px';

        self.animate(currentSlide, {bottom: 0, right: 0});
      },
      slideInTopRight: function(){
        currentSlide.style.bottom = sliderHeight+'px';
        currentSlide.style.left = sliderWidth+'px';

        self.animate(currentSlide, {bottom: 0, left: 0});
      },
      slideInBottomLeft: function(){
        currentSlide.style.top = sliderHeight+'px';
        currentSlide.style.right = sliderWidth+'px';

        self.animate(currentSlide, {top: 0, right: 0});
      },
      slideInBottomRight: function(){
        currentSlide.style.top = sliderHeight+'px';
        currentSlide.style.left = sliderWidth+'px';

        self.animate(currentSlide, {top: 0, left: 0});
      }
    };

    // If special transition, set transition to correct one
    if (transition == 'slideInVertical') {
      transition = (currentSlideID > lastSlideID ? 'slideInTop' : 'slideInBottom');
    } else if (transition == 'slideInVerticalReversed') {
      transition = (currentSlideID < lastSlideID ? 'slideInTop' : 'slideInBottom');
    } else if (transition == 'slideInHorizontal') {
      transition = (currentSlideID > lastSlideID ? 'slideInRight' : 'slideInLeft');
    } else if (transition == 'slideInHorizontalReversed') {
      transition = (currentSlideID < lastSlideID ? 'slideInRight' : 'slideInLeft');
    }

    return transitions[transition];
  };

  /**
   * Animate object from current prop value to the one specified in properties
   */
  this.animate = function(obj, properties, duration, easing){
    var 
      self = this,
      options = self.options,
      data = self.data,
      tweenFunction,
      timeStart = new Date().getTime();

    if (!duration) duration = options.transition.duration;
    if (!easing) easing = options.transition.easing;

    tweenFunction = self._tween(easing);

    // Set transition to true
    self.data.transition = true;

    var animate = setInterval(function(){
      var timePassed = new Date().getTime() - timeStart;

      if (timePassed >= duration) timePassed = duration;

      // Run property update per property
      for (var prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          var 
            currentValue = obj.style[prop],
            propValue = properties[prop],
            newValue = null,
            convertInt = false,
            currentSuffix = null;

          if (currentValue !== parseInt(currentValue)) currentSuffix = currentValue.replace(/[0-9\.]+/, '');
          currentValue = parseInt(currentValue);
          propValue = parseInt(propValue);

          if (currentValue > properties[prop]) {
            newValue = currentValue-tweenFunction(timePassed, propValue, currentValue, duration);
          } else if (currentValue != properties[prop]) {
            newValue = tweenFunction(timePassed, currentValue, propValue, duration);
          } else { newValue = currentValue; }

          newValue = newValue+'';
          newValue = newValue.replace(/([0-9]+(\.[0-9]{0,3})?).*/, "$1");
          newValue = parseFloat(newValue);

          if (currentSuffix) {
            newValue = newValue+currentSuffix;
          }

          obj.style[prop] = newValue;
        }
      }

      if (timePassed >= duration) {
        clearInterval(animate);

        // Make sure all properties are set to the correct final value
        for (var prop in properties) {
          if(properties.hasOwnProperty(prop)) {
            var propValue = properties[prop],
                propSuffix = null;

            if (propValue !== parseInt(propValue)) propSuffix = propValue.replace(/[0-9\.]+/, '');

            propValue = parseInt(propValue);

            obj.style[prop] = (propSuffix ? propValue+propSuffix : propValue);

            // Set transition to false
            self.data.transition = false;
          }
        }
      }
    },24);
  };

  /**
   * Merge multiple objects into one
   */
  this._merge = function(){
    var 
      self = this,
      arraynew = {};

    for (var ai in arguments) {
      var array = arguments[ai];
      for (var index in array) {
        var value = null;
        if (array.hasOwnProperty(index)) {
          if (typeof array[index] == 'object' && arraynew[index] && typeof arraynew[index] == 'object') value = self._merge(arraynew[index], array[index]);
          else value = array[index];

          arraynew[index] = value;
        }
      }
    }

    return arraynew;
  }

  this._tween = function(type){
    var tweens = {
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
    };

    return tweens[type];
  };

  // Run construct after everything is defined
  this._construct(slideIdentifier, custom_options);
}