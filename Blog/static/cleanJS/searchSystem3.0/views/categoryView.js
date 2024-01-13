"use strict";

import { View } from "../../masterView.js";

class CategoryView extends View {
  #categoryMenu = document.querySelector(".menu");
  #selectedCategroy = document.querySelector(".selected");
  #categoriesRow = document.querySelector(".categories-btns-row");

  getCategory() {
    return this.#selectedCategroy.innerText ?? "Recent";
  }

  addListeners(callbackFunc) {
    [this.#categoriesRow, this.#categoryMenu].forEach((buttons) =>
      buttons.addEventListener("click", function (e) {
        if (e.target.dataset.category) callbackFunc();
      })
    );
  }
}

export default new CategoryView();
