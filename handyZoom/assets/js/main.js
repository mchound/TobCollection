$(function () {

    //var contents = [];
    //var content = new Content();
    //content.position = 0;
    //content.zoom = 0.3;
    //content.jQueryObject = $('.box3');
    //contents.push(content);
    //content = new Content();
    //content.position = 1;
    //content.zoom = 0.2;
    //content.jQueryObject = $('.box2');
    //contents.push(content);
    //content = new Content();
    //content.position = 2;
    //content.zoom = 0.1;
    //content.jQueryObject = $('.box1');
    //contents.push(content);
    //contents[0].zoomIn();

    $('body').handyZoom();

});

function handle(delta) {
    if (delta < 0) {
    }
    else {
    }
}

/** Event handler for mouse wheel event.
 */
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

/** Initialization code. 
 * If you use your own event management code, change it as required.
 */
if (window.addEventListener)
    /** DOMMouseScroll is for mozilla. */
    window.addEventListener('DOMMouseScroll', wheel, false);
/** IE/Opera. */
window.onmousewheel = document.onmousewheel = wheel;