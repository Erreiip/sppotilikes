function adjustContainerHeight() {
    const container = $("#caroussel");
    const cards = container.find(".card");

    cards.each(function () {
        let face = $(this).find(".face");
        let rowHeight = Math.max(...face.map(function () {
            return $(this).outerHeight();
        }).get());
        rowHeight += 10;
        $(this).css("height", rowHeight + "px");
    });
  }

$(document).ready(function () {

    adjustContainerHeight();

    $('.flip').hover(function () {
        $(this).find('.card').toggleClass('flipped');
        
    });
});

$(window).resize(function () {
    adjustContainerHeight();
});