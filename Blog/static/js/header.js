"use strict";

// Hover on navlinks effect.
const navBar = document.querySelector(".navbar-collapse");

const makeBold = function (e) {
  if (!e.target.classList.contains("nav-link")) return;

  const links = navBar.querySelectorAll(".nav-link");

  links.forEach((link) => {
    if (link !== e.target) link.style.opacity = this;
  });
};

navBar.addEventListener("mouseover", makeBold.bind(0.5));

navBar.addEventListener("mouseout", makeBold.bind(1));

// Dark and Light Mode.
document.documentElement.style.setProperty("--color-darkMode", "black");
document.documentElement.style.setProperty("--color-darkModeText", "white");

const lines = document.querySelectorAll("hr");
const body = document.querySelector("body");
const viewBtn = document.querySelector(".light-btn");
const btns = new Array(...document.querySelectorAll(".btn"));
const filledbtnsPrimary = btns.filter((btn) =>
  btn.classList.contains("btn-primary")
);
const filledbtnsDanger = btns.filter((btn) =>
  btn.classList.contains("btn-danger")
);
const filledbtnsInfo = btns.filter((btn) => btn.classList.contains("btn-info"));
const outlineBtnsDark = document.querySelectorAll(".btn-outline-dark");

const anchors = document.querySelectorAll("a");
const frontImage = document.querySelector(".masthead");
document
  .querySelectorAll(".fas-anchor")
  .forEach((a) => (a.style.color = "#212529"));

const lazyLoad = function (entries, observer) {
  const [entry] = entries;
  if (entry.isIntersecting) {
    frontImage.style.backgroundImage = this;

    frontImage.classList.remove("lazy-img");
    observer.unobserve(entry.target);
  }
};

const changeMode = function () {
  fetch(`/change_view/${this}`)
    .then((response) => response.json())
    .then((data) => (data["mode"] ? darkmode() : lightmode()));
};

const darkmode = function () {
  viewBtn.textContent = "Light Mode 🌞";
  body.classList.add("dark-mode-active");
  btns.forEach((btn) => {
    if (!btn.classList.contains("btn-outline-danger"))
      btn.classList.add("btn-outline-light");

    btn?.classList.remove("btn-info");
    btn?.classList.remove("btn-primary");
    btn?.classList.remove("btn-danger");
    btn?.classList.remove("btn-outline-dark");
  });
  lines.forEach(
    (line) => (line.style.borderTop = "1px solid rgba(255,255,255,0.5)")
  );
  try {
    dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".select").style.color = "white";
      dropdown.querySelector(".menu").style.color = "white";
      dropdown.querySelector(".caret").style.borderTop = "6px solid white";
    });
  } catch (ReferenceError) {}

  document.documentElement.style.setProperty("--anchor-color", "white");

  // lazy loading the big image.
  const observer = new IntersectionObserver(
    lazyLoad.bind(frontImage.dataset.srcDark),
    {
      root: null,
      threshold: 0,
      rootMargin: "50px",
    }
  );
  observer.observe(frontImage);
};

const lightmode = function () {
  viewBtn.textContent = "Dark Mode 🌙";
  body.classList.remove("dark-mode-active");
  btns.forEach((btn) => btn.classList.remove("btn-outline-light"));
  filledbtnsDanger.forEach((btn) => {
    btn.classList.add("btn-danger");
  });
  filledbtnsInfo.forEach((btn) => {
    btn.classList.add("btn-info");
  });
  filledbtnsPrimary.forEach((btn) => {
    btn.classList.add("btn-primary");
  });
  outlineBtnsDark.forEach((btn) => {
    btn.classList.add("btn-outline-dark");
  });

  lines.forEach((line) => (line.style.borderTop = "1px solid rgba(0,0,0,.1)"));
  try {
    dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".select").style.color = "black";
      dropdown.querySelector(".menu").style.color = "black";
      dropdown.querySelector(".caret").style.borderTop = "6px solid black";
    });
  } catch (ReferenceError) {}

  const observer = new IntersectionObserver(
    lazyLoad.bind(frontImage.dataset.srcLight),
    {
      root: null,
      threshold: 0,
      rootMargin: "50px",
    }
  );
  observer.observe(frontImage);

  document.documentElement.style.setProperty("--anchor-color", "212529");
};

changeMode.bind(0)();
viewBtn.addEventListener("click", changeMode.bind(1));
