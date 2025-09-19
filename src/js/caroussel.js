function adjustContainerHeight() {
    const container = $("#caroussel");
    const cards = container.find(".card");

    let maxSize = 0;
    cards.each(function () {
        let face = $(this).find(".face");
        let rowHeight = Math.max(...face.map(function () {
            return $(this).outerHeight();
        }).get());
        rowHeight += 40;
        if (rowHeight > maxSize) {
            maxSize = rowHeight;
        }
    });

    cards.each(function () {
        $(this).css("height", maxSize + "px");
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