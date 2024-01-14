"use strict";

import { View } from "../../masterView.js";
import {
  AMOUNT_OF_PAGES_PER_BLOG,
  MAX_AMOUNT_OF_PAGES_BUTTONS,
} from "../../config.js";

class PaginationView extends View {
  _container = document.querySelector("div[data-btn-map]"); // pageBtnsContainer
  #nextPageBtn = document.querySelector("#next-page .btn");
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
      if (!e.target.dataset?.num) return;
      this.page = +e.target.dataset.num;
      callbackFunc();
    }.bind(this);

    [this.#nextPageBtn, this._container].forEach((button) =>
      button.addEventListener("click", nextPage)
    );
  }

  showPagination(blogsAmount) {
    const pagesBack = Math.floor(MAX_AMOUNT_OF_PAGES_BUTTONS / 2);
    const pageStart = this.page > pagesBack ? this.page - pagesBack : 1;
    const len =
      blogsAmount / AMOUNT_OF_PAGES_PER_BLOG > MAX_AMOUNT_OF_PAGES_BUTTONS
        ? MAX_AMOUNT_OF_PAGES_BUTTONS
        : blogsAmount / AMOUNT_OF_PAGES_PER_BLOG;

    this._container.innerHTML = "";
    Array.from({ length: len }, (_, i) => pageStart + i).forEach((num) => {
      this._container.insertAdjacentHTML("beforeend", this.markUp(num));
    });
  }
}

export default new PaginationView();
