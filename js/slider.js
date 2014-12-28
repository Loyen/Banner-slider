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
        effect: 'fade',
        pause: 300,
        duration: 500,
        easing: 'linear'
      },
      random: false
    };

    slider.prototype.data = {
      currentSlide: null,
      lastSlide: null,
      slides: []
    }

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

    slider.prototype._initiate = function(){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides;

      for (var i = 0; i < slides.length; i++)
      {
        slides[i].style.display = 'none';
      }

      // Set current slide
      data.currentSlide = (options.random ? self.randomSlide() : 0);

      self.newSlide(data.currentSlide);
    };

    slider.prototype.newSlide = function(slideID){
      var 
        self = this,
        options = self.options,
        data = self.data,
        slides = data.slides,
        lastSlide = data.lastSlide,
        currentSlide = data.currentSlide,
        sliderWidth = data.slider.offsetWidth,
        sliderHeight = data.slider.offsetHeight;

      console.log(slideID);

      if (!slides[slideID]) {
        currentSlide = slides[currentSlide];
        currentSlide.style.left = 'auto';
        currentSlide.style.top = 'auto';
        currentSlide.style.bottom = 'auto';
        currentSlide.style.right = 'auto';
        console.log('sorry bro, no slide');
        return true;
      }

      currentSlide = slides[slideID];

      console.log(slideID+' exists and will be animated');

      var easingFunction = self._easing('linear');

      currentSlide.style.left = sliderWidth+'px';
      currentSlide.style.display = 'block';
      var offsetLeft = currentSlide.offsetLeft;

      self._animate({
        run: function(duration, timePassed){
          var newOffset = offsetLeft-easingFunction(timePassed, 0, offsetLeft, duration)+'px';
          if (newOffset >= sliderWidth) newOffset = sliderWidth;
          currentSlide.style.left = newOffset;
          //currentSlide.style.left = easingFunction(timePassed, offsetLeft, 0, duration)+'px';
        },
      });
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

    slider.prototype._click = function(item, e){
    };

    slider.prototype._animate = function(obj){
      var 
        self = this,
        options = self.options,
        duration = obj.duration || options.animation.duration,
        timeStart = new Date().getTime(),

      animate = setInterval(function(){
        var timePassed = new Date().getTime() - timeStart;

        // Run animation, log if none set
        if (obj.run) obj.run(duration, timePassed);
        else console.log('No animation set.', 'warning');

        console.log(timePassed + ' ' + duration);

        if (timePassed >= duration){
          clearInterval(animate);

          // Do complete function 
          if (obj.complete) obj.complete();
        }
      },0);
    };

    slider.prototype._easing = function(easing){
      var self = this;
      return {
        linear: function(t, b, c, d){
          return c * (t / d) + b;
        },
        easeIn: function(t, b, c, d){
          return c*Math.pow(t / d, 1);
        },
        easeOut: function(t, b, c, d){
          return c*(1-Math.pow(1 - (t / d), 1));
        }
      }[easing];
    };

    slider.prototype.log = function(message, type){
      if (!type) type = 'notice';

      type = type.toUpperCase();

      console.log(message);
    };

    return slider;
  }

  window.slider = sliderDefinition();

})(window);