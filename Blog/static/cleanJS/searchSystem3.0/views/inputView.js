"use strict";

import { View } from "../../masterView.js";

class InputView extends View {
  _container;
  #input = document.querySelector("#bar-search"); // searchBar
  #button = document.querySelector("#button-addon2");

  getSearch = function () {
    if (this.#input.value) return this.#input.value;
    return undefined;
  };

  resetSearch() {
    this.#input.value = "";
  }

  addListeners(callbackFunc) {
    this.#button.addEventListener("click", callbackFunc);
    this.#input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") callbackFunc();
    });
  }
}

export default new InputView();
