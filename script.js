document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.getElementById("navLinks");
  const button = document.getElementById("cta-button");

  hamburger.addEventListener("click", function () {
    nav.classList.toggle("active");
    button.classList.toggle("active");

    if (nav.classList.contains("active")) {
      hamburger.innerHTML = "&times;";
    }
    else {
      hamburger.innerHTML = "&#9776;";
    }
  });
});

function scrollToSection (event, id) {
  event.preventDefault();
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}
