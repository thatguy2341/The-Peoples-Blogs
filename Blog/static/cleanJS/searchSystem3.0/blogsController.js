"use strict";

import paginationView from "./views/paginationView.js";
import blogsView from "./views/blogsView.js";
import categoryView from "./views/categoryView.js";
import inputView from "./views/inputView.js";
import { getBlogs, state } from "./blogsModel.js";
import { AMOUNT_OF_PAGES_PER_BLOG } from "../config.js";

const searchControler = async function () {
  //1.get search:
  blogsView.renderSpinner();
  await getBlogs(inputView.getSearch(), categoryView.getCategory());
  // 2. show search:
  blogsView.showBlogs(
    state.blogs.slice(
      paginationView.page - 1,
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG +
        AMOUNT_OF_PAGES_PER_BLOG
    ),
    false,
    inputView.getSearch()
  );
  // 3. reset search:
  inputView.resetSearch();
};

const startBlogs = async function () {
  blogsView.renderSpinner();
  await getBlogs();
  const data = state.blogs.slice(0, AMOUNT_OF_PAGES_PER_BLOG);
  blogsView.showBlogs(data, true);
  controlAccessories();
};

const controlGetPage = function () {
  controlAccessories();
  blogsView.renderSpinner();
  blogsView.showBlogs(
    state.blogs.slice(
      paginationView.page - 1,
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG +
        AMOUNT_OF_PAGES_PER_BLOG
    )
  );
};

/**
 * Controls pagination and the button to go to the next page.
 */
const controlAccessories = function () {
  if (
    state.blogs.length <
    (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG +
      AMOUNT_OF_PAGES_PER_BLOG -
      1
  ) {
    paginationView.hideNextPageBtn();
  } else {
    paginationView.showNextPageBtn();
    paginationView.setNextPageBtn();
  }
  paginationView.showPagination();
};

const controlSize = function () {
  blogsView.changeMessages();
};

const init = function () {
  startBlogs();
  controlSize();
  paginationView.addListeners(controlGetPage);
  inputView.addListeners(searchControler);
  categoryView.addListeners(searchControler);
  window.addEventListener("resize", controlSize);
};
init();
