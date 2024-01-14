"use strict";

import { View } from "../../masterView.js";
import { toTitle } from "../../extention.js";

class CategoryView extends View {
  #categoryMenu = document.querySelector(".menu");
  #selectedCategroy = document.querySelector(".selected");
  #categoriesRow = document.querySelector(".categories-btns-row");

  getCategory() {
    return this.#selectedCategroy.innerText.toLowerCase() ?? "recent";
  }

  addListeners(callbackFunc) {
    [this.#categoriesRow, this.#categoryMenu].forEach((buttons) =>
      buttons.addEventListener(
        "click",
        function (e) {
          if (!e.target.dataset.category) return;
          this.#selectedCategroy.innerText = toTitle(e.target.innerText);
          callbackFunc();
        }.bind(this)
      )
    );
  }
}

export default new CategoryView();
