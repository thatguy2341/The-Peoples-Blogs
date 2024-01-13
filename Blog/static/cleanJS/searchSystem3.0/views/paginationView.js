"use strict";

import { View } from "../../masterView.js";
import { MAX_AMOUNT_OF_PAGES_BUTTONS } from "../../config.js";

class PaginationView extends View {
  _container = document.querySelector("div[data-btn-map]"); // pageBtnsContainer
  #nextPageBtn = document.querySelector("#next-page");
  page = 1;

  markUp(page) {
    return `<a class="btn btn-outline-secondary pg-btn ${
      this.page === page && "active"
    }" data-num='${page}'>${page}</a>`;
  }

  hideNextPageBtn() {
    this.#nextPageBtn.classList.add("hidden");
  }

  showNextPageBtn() {
    this.#nextPageBtn.classList.remove("hidden");
  }

  setNextPageBtn() {
    this.#nextPageBtn.dataset.num = this.page + 1;
  }

  addListeners(callbackFunc) {
    const nextPage = function (e) {
      if (!e.dataset?.num) return;
      this.page = e.target.dataset.num;
      callbackFunc();
    }.bind(this);

    [this.#nextPageBtn, this._container].forEach((button) =>
      button.addEventListener("click", nextPage)
    );
  }

  showPagination() {
    const pagesBack = Math.floor(MAX_AMOUNT_OF_PAGES_BUTTONS / 2);
    const pageStart = this.page > pagesBack ? this.page - pagesBack : 1;
    const len =
      this.page > MAX_AMOUNT_OF_PAGES_BUTTONS
        ? MAX_AMOUNT_OF_PAGES_BUTTONS
        : this.page;

    this._container.innerHTML = "";
    Array.from({ length: len }, (_, i) => pageStart + i).forEach((num) => {
      this._container.insertAdjacentHTML("beforeend", this.markUp(num));
    });
  }
}

export default new PaginationView();
