﻿$(function () {
    $(window).load(function () {
        $('.newEraSlider').newEraSlider();
    });
});

(function ($) {

    $.fn.newEraSlider = function (options) {
        return this.each(function (index, slider) {
            var _newEraSlider = new NewEraSlider($(this), options);
        });
    };

    //Default settings
    $.fn.newEraSlider.defaultSettings = {
        interval: 3000
    };

})(jQuery);

var NewEraSlider = function (wrapper, options) {

    // Merge argument settings with default
    var settings = $.extend({}, $.fn.newEraSlider.defaultSettings, options);

    var variables = {
        sliderWidth: 0,
        sliderHeight: 0,
        slideCount: 0,
        currentSlide: 0
    };

    // Get slider and set class tobSlider if it is not already have it
    var sliderInner = $(wrapper).children('.slider');

    // Get dimensions of slider
    variables.sliderWidth = $(wrapper).width();
    variables.sliderHeight = $(wrapper).height();

    // enumerate all listItems of uordered list
    var _listItems = $(sliderInner).find('ul li');
    var listItems = [];
    $.each(_listItems, function (index, item) {
        var listItem = new ListItem(item, variables, _listItems.length, index);
        listItems.push(listItem);
        variables.slideCount++;
    });
    delete _listItems;

    // Run the slider
    var f = function () {
        clearInterval(timer);
        listItems[variables.currentSlide].Remove(function () {            
            $.each(listItems, function (index, item) { item.MoveForward(); });            
            if (++variables.currentSlide == variables.slideCount)
                variables.currentSlide = 0;
            listItems[variables.currentSlide].Run();            
        });
        timer = setInterval(f, listItems[variables.currentSlide].Duration);
    }
    var timer;
    setTimeout(function () {
        timer = setInterval(f, listItems[variables.currentSlide].Duration);
        listItems[variables.currentSlide].Run();        
    }, 1000);

    //var timer = setInterval(f, listItems[variables.currentSlide].Duration);
    
    // Slider container resize event
    $(window).resize(function () {
        variables.sliderWidth = $(wrapper).width();
        variables.sliderHeight = $(wrapper).height();
        $.each(listItems, function (index, item) {
            item.SliderResized(variables.sliderWidth, variables.sliderHeight);
        });
    });

}

var ListItem = function (jQueryListItem, variables, slideCount, index) {
    this._captions = [];
    this._jQueryElement = $(jQueryListItem);
    this._duration = parseFloat(this._jQueryElement.attr('data-duration')) * 1000; // Milliseconds
    this._z = slideCount - index-1;
    this._slideCount = slideCount;
    this._jQueryElement.css('z-index', this._z);
    var captions = this._jQueryElement.children('.caption');
    var self = this;
    $.each(captions, function (index, caption) {
        var _caption = new Caption(caption, variables);
        self._captions.push(_caption);
    });    
    
    return {
        Run: function (callback) {
            $.each(self._captions, function (index, caption) {
                caption.DoTransition();
            });
            
            //setTimeout(this.Remove, self._duration, callback);
        },

        Remove: function (callback) {
            self._jQueryElement.fadeOut(400, callback);
        },

        MoveForward: function () {
            if (++self._z == self._slideCount)
                self._z = 0;
            self._jQueryElement.css('z-index', self._z).css('display', 'block');
        },

        SliderResized: function(sliderWidth, sliderHeight){
            $.each(self._captions, function (index, caption) {
                caption.SliderResized(sliderWidth, sliderHeight);
            });
        },

        get Duration() {return self._duration}
    }
}

var Caption = function (jQueryCaptionElement, variables) {
    this._jQueryElement = $(jQueryCaptionElement);
    var width = this._jQueryElement.width();
    var height = this._jQueryElement.height();
    this._sliderWidth = variables.sliderWidth;
    this._sliderHeight = variables.sliderHeight;    
    this._x = this._jQueryElement.attr('data-x');
    this._y = this._jQueryElement.attr('data-y');
    this._xPerc = this._x / variables.sliderWidth;
    this._yPerc = this._y / variables.sliderHeight;

    this._direction = new Direction(
        this._jQueryElement.attr('data-direction'),
        this._xPerc,
        this._yPerc,
        width,
        height,
        variables.sliderWidth,
        variables.sliderHeight);

    this._start = parseFloat(this._jQueryElement.attr('data-start'));
    this._duration = parseFloat(this._jQueryElement.attr('data-duration'));
    this._jQueryElement.css('width', width).css('left', this._direction.StartX).css('top', this._direction.StartY).css('-webkit-transition-delay', this._start + 's').css('-webkit-transition-duration', '0.3s');
    
    var self = this;
    return {
        DoTransition: function () {
            self._jQueryElement.css('-webkit-transition-property', 'all').css('-webkit-transition-delay', self._start + 's').css('-webkit-transition-duration', '0.3s');
            self._jQueryElement.css('left', self._direction.X).css('top', self._direction.Y); //.css('opacity', '1')
            setTimeout(this.RevertTransition, this.TotalDuration * 1000 + 300);
            setTimeout(this.ResetTransition, this.TotalDuration * 1000 + 300 + 300);
        },

        RevertTransition: function(){
            self._jQueryElement.css('left', self._direction.EndX).css('top', self._direction.EndY).css('-webkit-transition-delay', '0s'); //.css('opacity', '0')
        },

        ResetTransition: function(){            
            self._jQueryElement.css('left', self._direction.StartX).css('top', self._direction.StartY).css('-webkit-transition-property', 'none');
        },

        SliderResized: function(sliderWidth, sliderHeight){
            delete self._direction;
            self._direction = new Direction(
                self._jQueryElement.attr('data-direction'),
        self._xPerc,
        self._yPerc,
        width,
        height,
        sliderWidth,
        sliderHeight);
        },

        get TotalDuration() {
            return parseFloat(self._start + self._duration);
        }
    }
}

var Direction = function (directionDefinition, procX, procY, width, height, containerWidth, containerHeight) {
    this._startX = 0;
    this._startY = 0;
    this._endX = 0;
    this._endY = 0;
    this._x = parseFloat(containerWidth * procX);
    this._y = parseFloat(containerHeight * procY);
    switch (directionDefinition) {
        //Left
        case 'ltr':
            this._startX = -1 * width;
            this._startY = this._y;
            this._endX = containerWidth;
            this._endY = this._startY;
            break;
        case 'ltl':
            this._startX = -1 * width;
            this._startY = this._y;
            this._endX = -1 * width;
            this._endY = this._startY;
            break;
        case 'ltt':
            this._startX = -1 * width;
            this._startY = this._y;
            this._endX = this._x;
            this._endY = -1 * height;
            break;
        case 'ltb':
            this._startX = -1 * width;
            this._startY = this._y;
            this._endX = this._x;
            this._endY = height;
            break;
            //Right
        case 'rtr':
            this._startX = containerWidth;
            this._startY = this._y;
            this._endX = containerWidth;
            this._endY = this._startY;
            break;
        case 'rtl':
            this._startX = containerWidth;
            this._startY = this._y;
            this._endX = -1 * width;
            this._endY = this._startY;
            break;
        case 'rtt':
            this._startX = containerWidth;
            this._startY = this._y;
            this._endX = this._x;
            this._endY = -1 * height;
            break;
        case 'rtb':
            this._startX = containerWidth;
            this._startY = this._y;
            this._endX = this._x;
            this._endY = containerHeight;
            break;
            // Top
        case 'ttr':
            this._startX = this._x;
            this._startY = -1 * height;
            this._endX = containerWidth;
            this._endY = this._y;
            break;
        case 'ttl':
            this._startX = this._x;
            this._startY = -1 * height;
            this._endX = -1 * width;
            this._endY = this._y;
            break;
        case 'ttt':
            this._startX = this._x;
            this._startY = -1 * height;
            this._endX = this._x;
            this._endY = -1 * height;
            break;
        case 'ttb':
            this._startX = this._x;
            this._startY = -1 * height;
            this._endX = this._x;
            this._endY = containerHeight;
            break;
            // Bottom
        case 'btr':
            this._startX = this._x;
            this._startY = containerHeight;
            this._endX = containerWidth;
            this._endY = this._y;
            break;
        case 'btl':
            this._startX = this._x;
            this._startY = containerHeight;
            this._endX = -1 * width;
            this._endY = this._y;
            break;
        case 'btt':
            this._startX = this._x;
            this._startY = containerHeight;
            this._endX = this._x;
            this._endY = -1 * height;
            break;
        case 'btb':
            this._startX = this._x;
            this._startY = containerHeight;
            this._endX = this._x;
            this._endY = containerHeight;
            break;
        default:
    }

    var self = this;

    return {
        get X() { return parseInt(self._x) },
        get Y() {return parseInt(self._y)},
        get StartX() {return parseInt(self._startX)},
        get StartY() {return parseInt(self._startY)},
        get EndX() {return parseInt(self._endX)},
        get EndY() { return parseInt(self._endY) }
    }
}