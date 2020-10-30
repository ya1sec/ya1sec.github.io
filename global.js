$(document).ready(function () {
  // accordion sliding

  $(".accordion-title").click(function () {
    var x = $(this).closest("li").find(".accordion-body");

    if (x.is(":visible")) {
      x.delay(30).css("opacity", "0");
      console.log("opacity is 0");
    }

    x.slideToggle("slow", function () {
      if (x.is(":visible")) {
        setTimeout(function () {
          x.delay(30).css("opacity", "1");
          console.log("opacity is 1");
          return false;
        }, 30);
      }
    });
  });

  // bio pagination showing

  // $('.date a').click(function(){
  // 	$(this).parent().parent().find('nav.pagination').slideToggle();
  // });

  
});
