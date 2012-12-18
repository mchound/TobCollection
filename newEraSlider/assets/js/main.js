var APP = {};

$(function () {
    $('.newEraSlider').tobSlider();
});

(function ($) {

    $.fn.tobSlider = function (options) {
        var self = $(this);
        var self2 = this;
        var i = 1;
        return this.each(function (index, slider) {
            var sliderWrapper = $(this);
            var _tobSlider = new TobSlider(sliderWrapper, options);
        });
    };

    //Default settings
    $.fn.tobSlider.defaultSettings = {
        effect: 'tobSliderSlideUp',
        cols: 8,
        rows: 4,
        speed: 500,
        interval: 3000
    };

})(jQuery);

var TobSlider = function (wrapper, options) {
    
    // Merge argument settings with default
    var settings = $.extend({}, $.fn.tobSlider.defaultSettings, options);

    var variables = {
        sliceCount: 0,
        sliderWidth: 0,
        sliderHeight: 0,
        currentSlice: 0,
        onGoing: false
    };

    // Get slider and set class tobSlider if it is not already have it
    var slider = $(wrapper);
    if (!slider.hasClass('tobSlider'))
        slider.addClass('tobSlider');

    // Get slider dimensions
    variables.sliderWidth = slider.width();
    variables.sliderHeight = slider.height();

    // Enumerate slider childrens add get imageCollection
    var childrens = slider.children();
    var imgCollection = [];
    childrens.each(function () {
        var child = $(this);
        if (child.is('img')) {
            var tobSliderImage = new TobSliderImage(child, variables, settings);
            imgCollection.push(tobSliderImage);
        }
        else
            child.remove(); // TODO: Shouldn't remove. Add functionality for other selectors
        variables.sliceCount++;
    });

    if(variables.sliceCount > 1){
        slider.append(imgCollection[0].slices).append(imgCollection[1].slices);
        imgCollection[0].prepare();
        imgCollection[1].upNext();
    }

    var timer = setInterval(function () { doSlider(variables, imgCollection, null) }, settings.interval);
    
    var doSlider = function (variables, imgCollection, callback) {

        variables.onGoing = true;
        imgCollection[variables.currentSlice].doEffect(function () {
            
            variables.currentSlice = variables.currentSlice + 1 > variables.sliceCount - 1 ? 0 : variables.currentSlice + 1;
            var sliceUpNext = variables.currentSlice + 1 > variables.sliceCount - 1 ? 0 : variables.currentSlice + 1;
            var slicesUpNext = imgCollection[sliceUpNext].slices;

            imgCollection[variables.currentSlice].prepare();
            slider.append(slicesUpNext);
            imgCollection[sliceUpNext].upNext();
            if(callback)
                callback.apply(null);
            variables.onGoing = false;
        });        
    }

    slider.click(function () {
        if (!variables.onGoing) {
            clearInterval(timer);
            doSlider(variables, imgCollection, function () {
                timer = setInterval(function () { doSlider(variables, imgCollection, null) }, settings.interval);
            });
        }
    });


}

var TobSliderImage = function (img, sliderVariables, settings) {
    var image = $(img);
    var rows = image.attr('data-tobSlider-rows') === undefined ? settings.rows : parseInt(image.attr('data-tobSlider-rows'));
    var cols = image.attr('data-tobSlider-cols') === undefined ? settings.cols : parseInt(image.attr('data-tobSlider-cols'));
    var sliceHeight = parseInt(sliderVariables.sliderHeight / rows);
    var lastSliceHeight = sliderVariables.sliderHeight - sliceHeight * rows + sliceHeight;
    var sliceWidth = parseInt(sliderVariables.sliderWidth / cols);
    var lastSliceWidth = sliderVariables.sliderWidth - sliceWidth * cols + sliceWidth;
    var slice;
    this._slices = [];
    this._effect = image.attr('data-tobSlider-effect') === '' ? settings.effect : image.attr('data-tobSlider-effect');

    image.remove();

    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            if (row == rows - 1) {
                if (col == cols - 1)
                    slice = $('<div class="slice" style="width: ' + lastSliceWidth + 'px; height: ' + lastSliceHeight + 'px; left: ' + col * sliceWidth + 'px; top: ' + row * sliceHeight + 'px"><img src="' + image.attr('src') + '" style="left: -' + col * sliceWidth + 'px; top: -' + row * sliceHeight + 'px"/></div>');
                else
                    slice = $('<div class="slice" style="width: ' + sliceWidth + 'px; height: ' + lastSliceHeight + 'px; left: ' + col * sliceWidth + 'px; top: ' + row * sliceHeight + 'px"><img src="' + image.attr('src') + '" style="left: -' + col * sliceWidth + 'px; top: -' + row * sliceHeight + 'px"/></div>');
            }
            else {
                if (col == cols - 1)
                    slice = $('<div class="slice" style="width: ' + lastSliceWidth + 'px; height: ' + sliceHeight + 'px; left: ' + col * sliceWidth + 'px; top: ' + row * sliceHeight + 'px"><img src="' + image.attr('src') + '" style="left: -' + col * sliceWidth + 'px; top: -' + row * sliceHeight + 'px"/></div>');
                else
                    slice = $('<div class="slice" style="width: ' + sliceWidth + 'px; height: ' + sliceHeight + 'px; left: ' + col * sliceWidth + 'px; top: ' + row * sliceHeight + 'px"><img src="' + image.attr('src') + '" style="left: -' + col * sliceWidth + 'px; top: -' + row * sliceHeight + 'px"/></div>');
            }
            this._slices.push(slice);
        }
    }

    var self = this;

    return {
        slices: self._slices,
        upNext: function () {
            $.each(self._slices, function (index, slice) {
                slice.css('display', 'block').css('z-index', '0');
            });
        },
        prepare: function () {
            $.each(self._slices, function (index, slice) {
                slice.css('display', 'block').css('z-index', '998');
            });
        },
        doEffect: function (callback) {
            var _callback = null;
            for (var i = 0; i < self._slices.length; i++) {
                if (i == self._slices.length - 1)
                    _callback = callback;
                (function (slice, timeOut) {
                    if (_callback) {
                        setTimeout(function () {
                            window[self._effect](slice, function () {
                                slice.remove();
                                _callback.apply(null);
                            });
                        }, timeOut);
                    }
                    else {
                        setTimeout(function () {
                            window[self._effect](slice, function () {
                                slice.remove();
                            });
                        }, timeOut);
                    }
                })(self._slices[i], 100 + i*20, _callback);
            }
        }
    }
}

function tobSliderSlideUp(element, callback) {
    element.slideUp(100, null, callback);
}

function tobSliderFadeOut(element, callback) {
    element.fadeOut(100, null, callback);
}