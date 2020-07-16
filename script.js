let test = $("a");

document.addEventListener("mousemove", function (event) {
  const x = event.pageX;
  const y = event.pageY;

  const midX = x - window.innerWidth / 2;
  const midY = y - window.innerHeight / 2;

  const box = document.querySelector("section");

  box.style.left = x + "px";
  box.style.top = y + "px";

  box.style.transform =
    "rotateX(" + midY * 0.5 + "deg) rotateY(" + midX * 0.5 + "deg)";
});

window.onload = function () {
  //preload mouse down image here via Image()
  $("#cube")
    .bind("touchstart", function () {
      $("#cube").attr("src", "button_on.png");
      const x = event.pageX;
      const y = event.pageY;

      const midX = x - window.innerWidth / 2;
      const midY = y - window.innerHeight / 2;

      const box = document.querySelector("section");

      box.style.left = x + "px";
      box.style.top = y + "px";

      box.style.transform =
        "rotateX(" + midY * 0.5 + "deg) rotateY(" + midX * 0.5 + "deg)";
    })
    .bind("touchend", function () {});
};

$("#links").mouseenter(function () {
  $("#cube").addClass("hide");
});

$("#links").mouseleave(function () {
  $("#cube").removeClass("hide");
});

$("a").mouseenter(function () {
  $("#cube").addClass("hide");
});

$("a").mouseleave(function () {
  $("#cube").removeClass("hide");
});
