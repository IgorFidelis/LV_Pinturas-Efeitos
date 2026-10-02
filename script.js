let g = document.getElementById("gal"),
  bs = g.querySelectorAll("button"),
  fs = document.querySelectorAll(".filters button");
fs.forEach(function (f) {
  f.onclick = function () {
    fs.forEach(function (o) {
      o.setAttribute("aria-pressed", o === f);
    });
    bs.forEach(function (b) {
      b.hidden = f.dataset.f !== "all" && b.dataset.c !== f.dataset.f;
    });
  };
});
let lb = document.getElementById("lb");
bs.forEach(function (b) {
  b.onclick = function () {
    let i = b.querySelector("img");
    lb.querySelector("img").src = i.src;
    lb.querySelector("img").alt = i.alt;
    lb.querySelector("p").textContent = b.dataset.t;
    lb.showModal();
  };
});
document.getElementById("x").onclick = function () {
  lb.close();
};
lb.onclick = function (e) {
  if (e.target === lb) lb.close();
};
