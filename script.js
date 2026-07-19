document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburgerMenu") || document.querySelector(".hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            if (navLinks.classList.contains("active")) {
                hamburger.innerHTML = "&times;";
                hamburger.style.fontSize = "2rem";
            } else {
                hamburger.innerHTML = "&#9776;";
                hamburger.style.fontSize = "1.5rem";
            }
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                hamburger.innerHTML = "&#9776;";
                hamburger.style.fontSize = "1.5rem";
            });
        });
    }
});

function scrollToSection(event, id) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    }
}
