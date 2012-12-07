var APP = {};

$(function () {

    APP.container = $('.tobSlider');
    APP.sliderWidth = APP.container.width();
    APP.sliderHeight = APP.container.height();
    APP.sliceCount = 6;
    APP.sliceWidthFloat = APP.sliderWidth / APP.sliceCount;
    APP.sliceWidthInt = parseInt(APP.sliceWidthFloat);
    APP.lastSliceWidthAdd = APP.sliderWidth - APP.sliceWidthInt * APP.sliceCount;
    APP.sliderObjects = [];
    
    $.each($('.tobSlider img'), function (index, img) {
        var i = new sliderObject(img, index);
        APP.sliderObjects.push(i);        
    });

    setInterval(function () {
        $.each(APP.sliderObjects, function (index, obj) {
            if (obj.index == 0) {
                obj.index = APP.sliderObjects.length;
                obj.doEffect(function () {
                    $.each(APP.sliderObjects, function (index, _obj) {
                        _obj.index--;
                    });
                });
                return false;
            }
        });
    }, 4000);

    

    $('.tobSlider').click(function () {
        
    });

});


sliderObject = function (domElement, index) {
    if (!$(domElement).is('img'))
        return;
    
    this._image = domElement;
    this._effect = $(domElement).attr('data-tobSlider-effect');
    this._index = index;
    switch (index) {
        case 0:
            prepareForEffect(this._effect, this._image);
            $(this._image).remove();
            break;
        case 1:
            APP.container.append(this._image);
            break;
        default:
            $(this._image).remove();
    }

    var self = this;
    return {
        prepareForEffect: function () { prepareForEffect(self._effect, self._image) },
        doEffect: function (callback) { doEffect(self._effect, callback) },
        get index() {
            return self._index;
        },
        get effect() { return this._effect },
        set index(value) {
            var oldValue = self._index;
            self._index = value;
            switch (value) {
                case 0:
                    $(self._image).remove();
                    this.prepareForEffect();
                    break;
                case 1:
                    APP.container.append(self._image);
                    break;
                default:
            }
        }
    }
}

function prepareForEffect(effect, image) {
    switch (effect) {
        case 'slideUp':
            prepareSlideUpEffect(image);
            break;
        default:
    }
}

function prepareSlideUpEffect(img) {
    var slice;
    var image;
    var offsetLeft = 0;
    for (var i = 0; i < APP.sliceCount; i++) {

        slice = $('<div class="slice"></div>');
        slice.css('height', APP.sliderHeight).css('left', offsetLeft).css('z-index', 999);

        if (i == APP.sliceCount - 1)
            slice.css('width', APP.sliceWidthInt + APP.lastSliceWidthAdd);
        else
            slice.css('width', APP.sliceWidthInt);

        image = new Image();
        image.src = img.src;

        slice.append(image);
        slice.children('img').css('left', -1 * offsetLeft);

        APP.container.append(slice);
        offsetLeft += APP.sliceWidthInt;
    }
}

function doEffect(effect, callback) {
    switch (effect) {
        case 'slideUp':
            slideUpEffect(callback);
            break;
        default:
    }
}

function slideUpEffect(callback) {
    var slices = $('.tobSlider .slice');    
    var timeout = function (element, delay, last) {
        setTimeout(function () {
            $(element).slideUp(600, function () {
                $(element).remove();
                if(last)
                    callback.apply(this, null);
            })
        }, delay);
    };

    $(slices[0]).slideUp(600, function () {
        $(slices[0]).remove();
    });

    for (var i = 1; i < slices.length; i++) {
        if(i == slices.length - 1)
            timeout(slices[i], 100 + i * 100, true);
        else
            timeout(slices[i], 100 + i * 100, false);
    }    
}

function mySlideUp(element, speed, callback) {
    $(element).slideUp(speed, null, callback);
}