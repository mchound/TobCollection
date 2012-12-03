$(function () {

    $.get('home.html', function (data) {
        $('.page').append(data);
    });

    $('.scrollDown').click(function () {
        var top = $('.page')[0].style.posTop;
        top -= 20;
        $('.page').css('top', top + 'px');
    });

    $('.scrollUp').click(function () {
        var top = $('.page')[0].style.posTop;
        top += 20;
        $('.page').css('top', top + 'px');
    });

});