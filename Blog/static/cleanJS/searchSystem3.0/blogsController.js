"use strict";

import paginationView from "./views/paginationView.js";
import blogsView from "./views/blogsView.js";
import categoryView from "./views/categoryView.js";
import inputView from "./views/inputView.js";
import { getBlogs, state } from "./blogsModel.js";
import { AMOUNT_OF_PAGES_PER_BLOG } from "../config.js";

const searchControler = async function () {
  paginationView.page = 1;
  //1.get search:
  blogsView.renderSpinner();
  await getBlogs(inputView.getSearch(), categoryView.getCategory());
  // 2. show search:
  blogsView.showBlogs(
    state.blogs.slice(
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG,
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG +
        AMOUNT_OF_PAGES_PER_BLOG
    ),
    false,
    inputView.getSearch() // Dont like, but is just for error handling
  );
  // 3. reset search:
  inputView.resetSearch();
  // 4. take care of accesorries:
  controlAccessories();
};

const startBlogs = async function () {
  blogsView.renderSpinner();
  await getBlogs();
  const data = state.blogs.slice(0, AMOUNT_OF_PAGES_PER_BLOG);
  blogsView.showBlogs(data, true);
  controlAccessories();
};

const controlGetPage = function () {
  blogsView.renderSpinner();
  blogsView.showBlogs(
    state.blogs.slice(
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG,
      (paginationView.page - 1) * AMOUNT_OF_PAGES_PER_BLOG +
        AMOUNT_OF_PAGES_PER_BLOG
    )
  );
  controlAccessories();
};

/**
 * Controls pagination and the button to go to the next page.
 */
const controlAccessories = function () {
  if (state.blogs.length <= paginationView.page * AMOUNT_OF_PAGES_PER_BLOG) {
    paginationView.hideNextPageBtn();
  } else {
    paginationView.showNextPageBtn();
    paginationView.setNextPageBtn();
  }
  paginationView.showPagination(state.blogs.length);
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
