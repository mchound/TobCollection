$(function () {
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

function NewEraSlider(wrapper, options) {
    // Merge argument settings with default
    var settings = $.extend({}, $.fn.newEraSlider.defaultSettings, options);

    // Get slider and set class tobSlider if it is not already have it
    var sliderInner = $(wrapper).children('.slider');

    // Variables
    var variables = {
        sliderWidth: $(wrapper).width(),
        sliderHeight: $(wrapper).height(),
        slideCount: 0,
        currentSlide: 0
    };

    // enumerate all listItems of uordered list
    var _listItems = $(sliderInner).find('ul li');
    var listItems = [];
    for (var i = 0; i < _listItems.length; i++) {
        listItems.push(new ListItem(_listItems[i], variables, _listItems.length, i));
        variables.slideCount++;
    }
    delete _listItems;

    var f = function () {
        listItems[variables.currentSlide].Run(function () {
            for (var i = 0; i < listItems.length; i++) {
                listItems[i].Forward();
            }            
            if (++variables.currentSlide == variables.slideCount)
                variables.currentSlide = 0;
            f.apply(null);
        });
    }

    setTimeout(f, 1000);

    sliderInner.hover(
        function () {
            listItems[variables.currentSlide].Pause();
        },
        function () {
            listItems[variables.currentSlide].Resume();
        });
}

function ListItem(jQueryListItem, variables, _slideCount, index) {

    // ===============================
    // Private properties
    // ===============================
    var element = $(jQueryListItem);
    var captions = [];
    var _captions = element.children('.caption');
    for (var i = 0; i < _captions.length; i++) {
        captions.push(new Caption(_captions[i], variables.sliderWidth, variables.sliderHeight));
    }    
    delete _captions;
    var slideCount = _slideCount;
    var z = slideCount - index - 1;
    var duration = parseFloat(element.attr('data-duration')) * 1000;

    var stopWatch = new StopWatch(duration, 50);

    //var timer = {
    //    duration: parseFloat(element.attr('data-duration')) * 1000,
    //    elapsedTimed: 0,
    //    timeLeft: 0,
    //    timerId: -1,
    //    intervalId: -1,
    //    timeOutFunc: null
    //};

    // Private function for setting z-index
    var setZ = function () {
        element.css('z-index', z).css('display', 'block');
    }

    // ===============================
    // Constructor
    // ===============================
    // Initialize element
    setZ();

    // ===============================
    // Public methods
    // ===============================
    // Move list item forward in z
    this.Forward = function () {
        if (++z > slideCount - 1)
            z = 0;                    
        setZ();        
    };

    // Move list item backward in z
    this.Backward = function () {
        if (--z < 0)
            z = slideCount - 1;
        setZ();
    }

    // Function do transition for each caption
    this.Run = function (callback) {
        for (var i = 0; i < captions.length; i++) {
            captions[i].DoTransition();
        }
        var timeOutFunc = function () {
            element.fadeOut(400, function () {
                stopWatch.Reset();
                callback.apply(null);
            });
        }
        stopWatch.Start(timeOutFunc);
    }

    // Pause 
    this.Pause = function () {
        stopWatch.Pause();
    }

    // Resume
    this.Resume = function () {
        if(stopWatch.Status == 'paused')
            stopWatch.Resume();
    }
}

function StopWatch(_duration, accuracy) {
    var duration = _duration;
    var timeElapsed = 0;
    var intervalId = -1;
    var timerId = -1;
    var readyFunction = null;
    var runTimer = function () {
        intervalId = setInterval(function () {
            timeElapsed += accuracy;
            $('title').html(timeElapsed);
        }, accuracy);
    };

    this.Status = 'stopped';

    this.Start = function (func) {
        this.Status = 'running';
        readyFunction = func;
        timeElapsed = 0;
        runTimer();
        timerId = setTimeout(readyFunction, duration);        
    }

    this.Pause = function () {
        if (duration - accuracy > timeElapsed) {
            this.Status = 'paused';
            clearTimeout(timerId);
            clearInterval(intervalId);
        }
    }

    this.Resume = function () {
        runTimer();
        timerId = setTimeout(readyFunction, duration - timeElapsed);
        this.Status = 'running';
    }

    this.Reset = function () {
        this.Status = 'stopped';
        clearTimeout(timerId);
        clearInterval(intervalId);
        timeElapsed = 0;
    }
}

function Caption(jQueryCaptionElement, sliderWidth, sliderHeight) {

    // ===============================
    // Private properties
    // ===============================
    var element = $(jQueryCaptionElement);
    var x = element.attr('data-x');
    var y = element.attr('data-y');
    var percX = x / sliderWidth;
    var percY = y / sliderHeight;
    var width = element.width();
    var height = element.height();
    var delay = parseFloat(element.attr('data-start'));
    var duration = parseFloat(element.attr('data-duration'));
    var direction = new Direction(
        element.attr('data-direction'),
        percX,
        percY,
        width,
        height,
        sliderWidth,
        sliderHeight);
    
    // ===============================
    // Constructor
    // ===============================
    // Move the element inot start position. Set width, otherwise it will shrink due to postion outside container
    element.css('left', direction.StartX).css('top', direction.StartY).css('width', width);
    // Hack to position the elements before transition of first image
    element.css('left');

    // ===============================
    // Public methods
    // ===============================
    // Functions do transition
    this.DoTransition = function (callback) {
        //console.log(element.text() + ": DoTransition");
        element            
            .css('-webkit-transition-property', 'all')
            .css('-webkit-transition-delay', delay + 's')
            .css('-webkit-transition-duration', '0.3s')
            .css('left', direction.X)
            .css('top', direction.Y);
        
        // Wait startdelay + transition + duration, and then remove element
        setTimeout(function() {
            element
                .css('-webkit-transition-delay', '0s')
                .css('-webkit-transition-duration', '0.3s')
                .css('left', direction.EndX)
                .css('top', direction.EndY);
            
            // Wait transition time and then restore positions
            setTimeout(function(){
                element
                    .css('-webkit-transition-property', 'none')
                    .css('-webkit-transition-delay', '0s')
                    .css('-webkit-transition-duration', '0s')
                    .css('left', direction.StartX)
                    .css('top', direction.StartY);

                // Wait transition time and then do callback
                setTimeout(callback, 300);
            }, 300);

        }, (delay+duration)*1000 + 300);
    }

}

function Direction(directionDefinition, procX, procY, width, height, containerWidth, containerHeight) {
    var startX = 0;
    var startY = 0;
    var endX = 0;
    var endY = 0;
    var x = parseFloat(containerWidth * procX);
    var y = parseFloat(containerHeight * procY);

    switch (directionDefinition) {
        //Left
        case 'ltr':
            startX = -1 * width;
            startY = y;
            endX = containerWidth;
            endY = startY;
            break;
        case 'ltl':
            startX = -1 * width;
            startY = y;
            endX = -1 * width;
            endY = startY;
            break;
        case 'ltt':
            startX = -1 * width;
            startY = y;
            endX = x;
            endY = -1 * height;
            break;
        case 'ltb':
            startX = -1 * width;
            startY = y;
            endX = x;
            endY = height;
            break;
            //Right
        case 'rtr':
            startX = containerWidth;
            startY = y;
            endX = containerWidth;
            endY = startY;
            break;
        case 'rtl':
            startX = containerWidth;
            startY = y;
            endX = -1 * width;
            endY = startY;
            break;
        case 'rtt':
            startX = containerWidth;
            startY = y;
            endX = x;
            endY = -1 * height;
            break;
        case 'rtb':
            startX = containerWidth;
            startY = y;
            endX = x;
            endY = containerHeight;
            break;
            // Top
        case 'ttr':
            startX = x;
            startY = -1 * height;
            endX = containerWidth;
            endY = y;
            break;
        case 'ttl':
            startX = x;
            startY = -1 * height;
            endX = -1 * width;
            endY = y;
            break;
        case 'ttt':
            startX = x;
            startY = -1 * height;
            endX = x;
            endY = -1 * height;
            break;
        case 'ttb':
            startX = x;
            startY = -1 * height;
            endX = x;
            endY = containerHeight;
            break;
            // Bottom
        case 'btr':
            startX = x;
            startY = containerHeight;
            endX = containerWidth;
            endY = y;
            break;
        case 'btl':
            startX = x;
            startY = containerHeight;
            endX = -1 * width;
            endY = y;
            break;
        case 'btt':
            startX = x;
            startY = containerHeight;
            endX = x;
            endY = -1 * height;
            break;
        case 'btb':
            startX = x;
            startY = containerHeight;
            endX = x;
            endY = containerHeight;
            break;
        default:
    }

    return {
        X: x,
        Y: y,
        StartX: startX,
        StartY: startY,
        EndX: endX,
        EndY: endY
    }
}

