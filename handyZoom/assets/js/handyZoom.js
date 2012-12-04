(function ($)
{
    $.extend($.fn, {

        handyZoom: function () {

            // Initialization--------------------------------------
            var elements = $('.handyZoom');
            var c = new Contents(elements);

            // Scroll event----------------------------------------            
            if (window.addEventListener)            
                window.addEventListener('DOMMouseScroll', wheel, false);            
            window.onmousewheel = document.onmousewheel = wheel;
            function wheel(event) {
                var delta = 0;
                if (!event) /* For IE. */
                    event = window.event;
                if (event.wheelDelta) { /* IE/Opera. */
                    delta = event.wheelDelta / 120;
                } else if (event.detail) { /** Mozilla case. */
                    /** In Mozilla, sign of delta is different than in IE.
                     * Also, delta is multiple of 3.
                     */
                    delta = -event.detail / 3;
                }
                /** If delta is nonzero, handle it.
                 * Basically, delta is now positive if wheel was scrolled up,
                 * and negative, if wheel was scrolled down.
                 */
                if (delta)
                    handle(delta);
                /** Prevent default actions caused by mouse wheel.
                 * That might be ugly, but we handle scrolls somehow
                 * anyway, so don't bother here..
                 */
                if (event.preventDefault)
                    event.preventDefault();
                event.returnValue = false;
            }

            function handle(delta) {
                if (delta < 0) {
                    c.zoomOut();
                }
                else {
                    c.zoomIn();                        
                }
            }
        }
    });
})(jQuery);

Contents.prototype.objects = [];
Contents.prototype.content = function () {
    var self = this;
    return {
        _position: 0,
        _zoom: 0,
        _jQueryObject: null,
        _left: 0,
        _top: 0,
        _z: 0,

        zoomIn: function () {
            this.zoom += 0.01;
        },

        zoomOut: function () {
            this.zoom -= 0.01;
        },

        _limit: function (value, min, max) {
            if (value > 1)
                this.fullyZoomedEvent();
            return Math.min(Math.max(value, min), max);
        },

        _updateElement: function () {            
            $(this._jQueryObject).css('z-index', this._z).animate({
                zoom: this._zoom,
                left: this._left,
                top: this._top,

            }, 20, function () {
                // Animation complete.
            });
        },

        // Position
        set position(value) {
            this._position = value;
            this._updateElement();
        },
        get position() { return this._position },

        set jQueryObject(value) { this._jQueryObject = value; }, get jQueryObject() { return this._jQueryObject },
        set left(value) { this._left = value; this._updateElement(); }, get left() { return this._left },
        set top(value) { this._top = value; this._updateElement(); }, get top() { return this._top },
        set z(value) { this._z = value; this._updateElement(); }, get z() { return this._z },
        // zoom
        set zoom(value) {
            this._zoom = this._limit(value, 0.1, 1 - this._position * 0.1);
            this._updateElement();
        },
        get zoom() { return this._zoom },

        // Event handling
        _fullyZoomedCallback: null,
        addFullyZoomedListener: function (callback) {
            this._fullyZoomedCallback = callback;
        },
        fullyZoomedEvent: function () {
            //this._fullyZoomedCallback.apply(this, []);
        }
    }
};
Contents.prototype.constructor = function (elements) {

    var self = this;
    var content;
    var initLeft = elements.length * 50;
    var initTop = elements.length * 50;
    var initZoom = elements.length * 0.1;
    var initZ = elements.length;
    $.each(elements, function (index, element) {
        content = new self.content();
        content.jQueryObject = element;
        content.left = initLeft;
        content.top = initTop;
        content.zoom = initZoom;
        content.z = initZ;
        content.position = index;
        self.objects.push(content);
        initLeft -= 50;
        initTop -= 50;
        initZoom -= 0.1;
        initZ--;
    });
}

function Contents(elements) {

    var self = this;
    this.constructor(elements);

    // Fully zoomed event
    //for (var i = 0; i < this.objects.length; i++) {
    //    var _objects = this.objects;
    //    this.objects[i].addFullyZoomedListener(function (content, ev) {
    //        var lastObject = new self.content();
    //        lastObject.position = _objects[_objects.length - 1].position;
    //        lastObject.zoom = _objects[_objects.length - 1].zoom;
    //        lastObject.top = _objects[_objects.length - 1].top;
    //        lastObject.left = _objects[_objects.length - 1].left;
    //        lastObject.z = _objects[_objects.length - 1].z;
    //        for (var q = _objects.length - 1; q > 0; q--) {
    //            _objects[q].position = _objects[q-1].position;
    //            //_objects[q].zoom = _objects[q-1].zoom;
    //            _objects[q].top = _objects[q - 1].top;
    //            _objects[q].left = _objects[q - 1].left;
    //            _objects[q].z = _objects[q - 1].z;
    //        }
    //        _objects[0].position = lastObject.position;
    //        //_objects[0].zoom = lastObject.zoom;
    //        _objects[0].top = lastObject.top;
    //        _objects[0].left = lastObject.left;
    //        _objects[0].z = lastObject.z;

    //        var firstObject = _objects[0];
    //        for (var i = 0; i < _objects.length-1; i++) {
    //            _objects[i] = _objects[i + 1];
    //        }
    //        _objects[_objects.length - 1] = firstObject;

    //    });
    //}

    return {
        zoomOut: function () {
            for (var i = 0; i < self.objects.length; i++) {
                self.objects[i].zoomOut();
            }
        },

        zoomIn: function () {
            for (var i = 0; i < self.objects.length; i++) {
                self.objects[i].zoomIn();
            }
        }
    }

}

