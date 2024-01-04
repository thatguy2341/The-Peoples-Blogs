"use strict";

if (window.innerWidth < 400) {
  document.querySelector(".navbar-toggler").innerHTML =
    '<i class="fas fa-bars"></i>';
}

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

const body = document.querySelector("body");
const viewBtn = document.querySelector(".light-btn");
const btnsToChange = document.querySelectorAll(".btn[data-type]");
const submitBtn = document.getElementById("submit");
const anchors = document.querySelectorAll("a");
const frontImage = document.querySelector(".masthead");
document
  .querySelectorAll(".fas-anchor")
  .forEach((a) => (a.style.color = "#212529"));

// lazy loading the masthead.
const lazyLoad = function (picture) {
  const observer = new IntersectionObserver(
    function (entries, observer) {
      const [entry] = entries;
      if (entry.isIntersecting) {
        frontImage.style.backgroundImage = this;

        frontImage.classList.remove("lazy-img");
        observer.unobserve(entry.target);
      }
    }.bind(picture),
    {
      root: null,
      threshold: 0,
      rootMargin: "50px",
    }
  );
  observer.observe(frontImage);
};
lazyLoad(frontImage.dataset.start);

const changeMode = function () {
  fetch(`/change_view/${this}`)
    .then((response) => response.json())
    .then((data) => (data["mode"] ? darkmode() : lightmode()));
};

const darkmode = function () {
  const lines = document.querySelectorAll("hr");
  viewBtn.textContent = "🌞Light Mode ";
  body.classList.add("dark-mode-active");
  btnsToChange.forEach((btn) => {
    if (
      !btn.classList.contains("btn-outline-danger") &&
      !btn.classList.contains("confirmation-btn")
    ) {
      btn.classList.add("btn-outline-light");
      btn.classList.remove(btn.dataset.type);
    }
  });

  try {
    submitBtn.classList.remove("btn-primary");
    submitBtn.classList.add("btn-outline-light");
  } catch (ReferenceError) {}

  try {
    dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".select").style.color = "white";
      dropdown.querySelector(".menu").style.color = "white";
      dropdown.querySelector(".caret").style.borderTop = "6px solid white";
    });
  } catch (ReferenceError) {}

  document.documentElement.style.setProperty("--anchor-color", "white");
  document.documentElement.style.setProperty("--color-darkMode", "black");
  document.documentElement.style.setProperty("--color-darkModeText", "white");
  document.documentElement.style.setProperty(
    "--darkmode-border",
    "1px solid rgba(255,255,255,0.5)"
  );
  const darkData = document?.querySelector("[data-dark]");
  darkData ? (darkData.dataset.dark = "True") : "";

  lazyLoad(frontImage.dataset.srcDark);
};

const lightmode = function () {
  viewBtn.textContent = "🌙Dark Mode";
  body.classList.remove("dark-mode-active");
  btnsToChange.forEach((btn) => {
    btn.classList.remove("btn-outline-light");
    btn.classList.add(btn.dataset.type);
  });

  try {
    submitBtn.classList.add("btn-primary");
    submitBtn.classList.remove("btn-outline-light");
  } catch (ReferenceError) {}
  try {
    dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".select").style.color = "black";
      dropdown.querySelector(".menu").style.color = "black";
      dropdown.querySelector(".caret").style.borderTop = "6px solid black";
    });
  } catch (ReferenceError) {}
  const darkData = document?.querySelector("[data-dark]");
  darkData ? (darkData.dataset.dark = "") : "True";
  document.documentElement.style.setProperty("--anchor-color", "212529");
  document.documentElement.style.setProperty("--color-darkMode", "white");
  document.documentElement.style.setProperty("--color-darkModeText", "black");
  document.documentElement.style.setProperty(
    "--darkmode-border",
    "1px solid rgba(0,0,0,.1)"
  );
  lazyLoad(frontImage.dataset.srcLight);
};
viewBtn.addEventListener("click", changeMode.bind(1));

// responsive navbar
let oldScroll = window.scrollY;

const topFill = function () {
  const nav = document.querySelector("nav");
  const navItems = document.querySelectorAll(
    "#mainNav .navbar-nav>li.nav-item>a"
  );
  const navBrand = document.querySelector("#mainNav .navbar-brand");
  if (
    window.scrollY < oldScroll ||
    (window.scrollY < 100 && window.innerWidth > 992)
  ) {
    nav.style = `
    border-bottom: 1px solid #e9ecef;
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    `;
    navItems.forEach((item) => (item.style = "color: rgb(0, 0, 0, 0.8)"));
    navBrand.style = "color: rgb(0, 0, 0, 0.8)";
  } else {
    nav.style = "";
    navItems.forEach((item) => (item.style = ""));
    navBrand.style = "";
  }
  oldScroll = window.scrollY;
};

topFill();
document.addEventListener("scroll", topFill);

//////////////////////////////////////
// Log out system

// If user is inputing something important:
let stop = true;

document.querySelector("#submit")?.addEventListener("click", function () {
  stop = false;
});

window.addEventListener("beforeunload", function (e) {
  if (!stop) return;
  const inputs = document.querySelectorAll(
    "[data-important]>form .form-group .form-control"
  );
  inputs.forEach((input) => {
    if (input.value) {
      e.returnValue = "Any progress you made will not be saved are you sure?";
    }
  });
});

// On user exits logout user:
const logUserOut = function () {
  if (userId) fetch("/logout/");
};
window.addEventListener("unload", logUserOut);

// On user inactive logout user:
let logout = setTimeout(logUserOut, 1800_000);

const repeat = function () {
  clearTimeout(logout);
  logout = setTimeout(logUserOut, 1800_000);
};
document.addEventListener("click", repeat);
document.addEventListener("scroll", repeat);
document.addEventListener("pointermove", repeat);
document.addEventListener("keypress", repeat);
