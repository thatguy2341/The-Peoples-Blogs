"use strict";

import { darkMode } from "../headController.js";

class ViewMode {
  _container = document.querySelector("body");
  #viewBtn = document.querySelector(".light-btn");
  #btnsToChange = document.querySelectorAll(".btn[data-type]");
  #submitBtn = document.getElementById("submit");
  #dropdowns = document.querySelectorAll(".dropdown");
  #frontImage = document.querySelector(".masthead");

  getMode() {
    return this._container.dataset.darkMode === "True";
  }

  changeMode(callbackFunc) {
    darkMode
      ? this.#changeToDark(callbackFunc)
      : this.#changeToLight(callbackFunc);
  }

  changeDropDowns(color) {
    this.#dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".select").style.color = color;
      dropdown.querySelector(".menu").style.color = color;
      dropdown.querySelector(".caret").style.borderTop = `6px solid ${color}`;
    });
  }

  #changeToLight(lazyLoad) {
    this.#viewBtn.textContent = "🌙Dark Mode";
    this._container.classList.remove("dark-mode-active");
    this.#btnsToChange.forEach((btn) => {
      btn.classList.remove("btn-outline-light");
      btn.classList.add(btn.dataset.type);
    });

    try {
      this.#submitBtn.classList.add("btn-primary");
      this.#submitBtn.classList.remove("btn-outline-light");
    } catch (ReferenceError) {}
    if (this.#dropdowns) this.changeDropDowns("black");

    document.documentElement.style.setProperty("--anchor-color", "212529");
    document.documentElement.style.setProperty("--color-darkMode", "white");
    document.documentElement.style.setProperty("--color-darkModeText", "black");
    document.documentElement.style.setProperty(
      "--darkmode-border",
      "1px solid rgba(0,0,0,.1)"
    );
    lazyLoad(this.#frontImage, this.#frontImage.dataset.srcLight);
  }

  #changeToDark(lazyLoad) {
    this.#viewBtn.textContent = "🌞Light Mode ";
    this._container.classList.add("dark-mode-active");
    this.#btnsToChange.forEach((btn) => {
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
    if (this.#dropdowns) this.changeDropDowns("white");

    document.documentElement.style.setProperty("--anchor-color", "white");
    document.documentElement.style.setProperty("--color-darkMode", "black");
    document.documentElement.style.setProperty("--color-darkModeText", "white");
    document.documentElement.style.setProperty(
      "--darkmode-border",
      "1px solid rgba(255,255,255,0.5)"
    );

    lazyLoad(this.#frontImage, this.#frontImage.dataset.srcDark);
  }

  addViewListeners(changeModeFunc, lazyLoadFunc, changeSession) {
    this.#viewBtn.addEventListener(
      "click",
      function () {
        changeModeFunc();
        changeSession();
        this.changeMode(lazyLoadFunc);
      }.bind(this)
    );
  }
}

export default new ViewMode();
