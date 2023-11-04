"use strict";

const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {
  const select = dropdown.querySelector(".select");
  const caret = dropdown.querySelector(".caret");
  const menu = dropdown.querySelector(".menu");

  const options = dropdown.querySelectorAll(".menu li");
  const selected = dropdown.querySelector(".selected");

  select.addEventListener("click", () => {
    select.classList.toggle("select-clicked");
    caret.classList.toggle("caret-rotate");
    menu.classList.toggle("menu-open");
  });

  menu.addEventListener("click", function (e) {
    if (e.target.classList.contains("option")) {
      selected.innerText = e.target.innerText;
      select.classList.remove("select-clicked");
      caret.classList.remove("caret-rotate");
      this.classList.remove("menu-open");
      options.forEach((option) => {
        option.classList.remove("dropdown-active");
      });
      e.target.classList.add("dropdown-active");
    }
  });
});
