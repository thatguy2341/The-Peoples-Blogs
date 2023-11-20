"use strict";

const dropdowns = document.querySelectorAll(".dropdown");
const categoriesBtnsRow = document.querySelector(".categories-btns-row");

dropdowns.forEach((dropdown) => {
  const select = dropdown.querySelector(".select");
  const caret = dropdown.querySelector(".caret");
  const menu = dropdown.querySelector(".menu");

  const options = dropdown.querySelectorAll(".menu li");
  const selected = dropdown.querySelector(".selected");
  const searchRow = dropdown.closest("#search-blogs");

  select.addEventListener("click", () => {
    select.classList.toggle("select-clicked");
    caret.classList.toggle("caret-rotate");
    menu.classList.toggle("menu-open");
    menu.classList.remove("menu-disable");
    searchRow.classList.toggle("search-margin");
  });

  menu.addEventListener("click", function (e) {
    if (e.target.classList.contains("option")) {
      selected.innerText = e.target.innerText;
      select.classList.remove("select-clicked");
      caret.classList.remove("caret-rotate");
      menu.classList.add("menu-disable");
      this.classList.remove("menu-open");
      searchRow.classList.remove("search-margin");
      options.forEach((option) => {
        option.classList.remove("dropdown-active");
      });
      e.target.classList.add("dropdown-active");
    }
  });
});

const checkSize = function () {
  if (window.innerWidth <= 768) {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.add("dropdown-disable");
    });
    document.querySelector(".search-bar").classList = " input-group search-bar";
    categoriesBtnsRow.classList.remove("categories-btns-disable");
  } else {
    dropdowns.forEach((dropdown) =>
      dropdown.classList.remove("dropdown-disable")
    );
    document.querySelector(".search-bar").classList =
      " col col-lg-10 col-md-9 col-sm-9 input-group search-bar";
    categoriesBtnsRow.classList.add("categories-btns-disable");
  }
};

checkSize();

window.addEventListener("resize", checkSize);
