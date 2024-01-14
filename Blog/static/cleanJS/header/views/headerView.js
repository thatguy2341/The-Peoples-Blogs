"use strict";

import { View } from "../../masterView.js";

class HeaderView extends View {
  _container = document.querySelector("body"); // body;
  #frontImage = document.querySelector(".masthead");
  #submitBtn = document.querySelector("#submit");
  #logoutTimer;
  #stop = true;
  #inputs = document.querySelectorAll(
    "[data-important]>form .form-group .form-control"
  );

  setPageProperties(darkMode) {
    this.lazyLoadPicture(this.#frontImage, this.#frontImage.dataset.start);
    document
      .querySelectorAll(".fas-anchor")
      .forEach((a) => (a.style.color = "#212529"));

    if (darkMode) {
      document.documentElement.style.setProperty("--anchor-color", "white");
      document.documentElement.style.setProperty("--color-darkMode", "black");
      document.documentElement.style.setProperty(
        "--color-darkModeText",
        "white"
      );
      document.documentElement.style.setProperty(
        "--color-spinner",
        "#f8f9fa!important;"
      );
      document.documentElement.style.setProperty(
        "--darkmode-border",
        "1px solid rgba(255,255,255,0.5)"
      );
      this._container.classList.add("dark-mode-active");
    } else {
      document.documentElement.style.setProperty("--anchor-color", "212529");
      document.documentElement.style.setProperty("--color-darkMode", "white");
      document.documentElement.style.setProperty(
        "--color-darkModeText",
        "black"
      );
      document.documentElement.style.setProperty(
        "--color-spinner",
        "#212529!important;"
      );
      document.documentElement.style.setProperty(
        "--darkmode-border",
        "1px solid rgba(0,0,0,.1)"
      );
      this._container.classList.remove("dark-mode-active");
    }
  }

  lazyLoadPicture(imgElement, picture) {
    const observer = new IntersectionObserver(
      function (entries, observer) {
        const [entry] = entries;
        if (entry.isIntersecting) {
          entry.target.style.backgroundImage = this;

          entry.target.classList.remove("lazy-img");
          observer.unobserve(entry.target);
        }
      }.bind(picture),
      {
        root: null,
        threshold: 0,
        rootMargin: "50px",
      }
    );
    observer.observe(imgElement);
  }

  addDisconnectListeners(logoutFunc) {
    window.addEventListener("unload", logoutFunc);

    // On user inactive => logout user:
    this.#logoutTimer = setTimeout(logoutFunc, 900_000);

    // Listeners that will stop logging out:
    ["click", "scroll", "pointermove", "keypress"].forEach((eve) => {
      document.addEventListener(
        eve,
        function () {
          clearTimeout(this.#logoutTimer);
          this.#logoutTimer = setTimeout(logoutFunc, 900_000);
        }.bind(this)
      );
    });
  }

  addProgressProtectionListener() {
    this.#submitBtn?.addEventListener(
      "click",
      function () {
        this.#stop = false;
      }.bind(this)
    );
    window.addEventListener(
      "beforeunload",
      function (e) {
        if (!this.#stop) return;

        this.#inputs.forEach((input) => {
          if (input.value) {
            e.returnValue =
              "Any progress you made will not be saved are you sure?";
          }
        });
      }.bind(this)
    );
  }
}

export default new HeaderView();
