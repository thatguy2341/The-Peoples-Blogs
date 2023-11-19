"use strict";

import { Info } from "./infoSystem.js";

const searchBar = document.querySelector(".bar-search");
const searchBtn = document.querySelector(".btn-search");
const categoryMenu = document.querySelector(".menu");
const selectedCategroy = document.querySelector(".selected");
const sectionsContainer = document.querySelector(".blogs-container");
const pageBtnsContainer = document.querySelector("div[data-btn-map]");
const nextPageBtn = document.querySelector("#next-page");
const categories = document.querySelector(".categories-btns-row");
let search = "";
let page;
//SCRIPT_ROOT = SCRIPT_ROOT || "https://the-peoples-blogs.onrender.com/";
//
//console.log(SCRIPT_ROOT);

const getCategory = function (targetCategory) {
  if (!targetCategory) return selectedCategroy.innerText ?? "Recent";
  else return targetCategory;
};

const getSearch = function () {
  search = searchBar.value;
  return search;
};

const getPage = async function () {
  const response = await fetch("/get_page/0");
  const data = await response.json();
  page = Number(data["num"]);
};

const createHtmlForBlog = function (blog) {
  let html = `
            ${
              darkMode === true
                ? `<hr class='smooth-scroll light-line'>`
                : "<hr class='smooth-scroll'>"
            }
            <div class="post-preview" style="font-size: 1.25rem;">
                <a href="/get-posts/${blog.id}?raise_view=1">

                <h1 class="post-title">
                  ${blog.name}
                </h1>`;
  if (blog.description > 65) {
    html += `
                <h4 class="post-subtitle" style="font-size: 1.45rem; font-weight: 300;">
                   ${blog.description.slice(0, 64)}...
                </h4>`;
  } else {
    html += `<h4 class="post-subtitle">
                ${blog.description}
             </h4>`;
  }
  html += `</a>
            <div class="row">
               <p class="post-meta col-12">Created by
                  <a href="/view_profile/${blog.author_id}">${blog.author}</a>
                  on ${blog.created_date}
               </p>
               <h4 class="col-lg-2 col-md-2 col-sm-3 views">${blog.views} 👁️</h4>
            </div>
         </div>`;

  return html;
};

const showError = function () {
  if (blogsInfo.error)
    document.querySelector(".failed-search").textContent =
      blogsInfo.error + ` '${search}'`;
  else document.querySelector(".failed-search").textContent = "";
};

const addAccessories = function () {
  if (blogsInfo.infoList.length < page * 10 + 10) {
    document.querySelector("#next-page").classList.add("hidden");
  }
  if (blogsInfo.infoList.length > 9) {
    document.querySelector(".btn-hide").style.display = "none";
  }
  pageBtnsContainer.innerHTML = "";
  for (let rep = 0; rep <= page; rep++) {
    pageBtnsContainer.insertAdjacentHTML(
      "beforeend",
      `<a class="btn btn-outline-secondary pg-btn" data-num='${rep}'>${
        rep + 1
      }</a>`
    );
  }
};

const showBlogs = function () {
  getPage()
    .then(() => {
      sectionsContainer.innerHTML = "";
      blogsInfo.infoList.slice(page * 10, page * 10 + 10).forEach((blog) => {
        blogsInfo.showInfo({
          htmlBuilder: createHtmlForBlog,
          info: blog,
          container: sectionsContainer,
        });
      });

      if (this) blogsInfo.addSmoothScrolling();
      addAccessories();
    })
    .catch((error) => (blogsInfo.error = error));
};

const blogsInfo = new Info(`get_blogs/null/Recent`);

blogsInfo.getInfo({
  dataType: "blogs",
  showInfoFunc: showBlogs.bind(true),
});

const startForSearch = function (e) {
  e.preventDefault();
  blogsInfo.link = `get_blogs/${getSearch() || "null"}/${
    getCategory() || "null"
  }`;

  blogsInfo
    .getInfo({
      dataType: "blogs",
      showInfoFunc: showBlogs.bind(false),
    })
    .then(() => showError());
  searchBar.value = "";
};

const startForCategory = function (e) {
  if (e.target.classList.contains(this)) {
    blogsInfo.link = `get_blogs/${getSearch() || "null"}/${
      getCategory(e.target.textContent) || "null"
    }`;

    blogsInfo
      .getInfo({
        dataType: "blogs",
        showInfoFunc: showBlogs.bind(false),
      })
      .then(() => showError());
  }
};

const movePage = function (e) {
  fetch("/get_page/" + e.target.dataset.num).then(() => {
    blogsInfo.getInfo({
      dataType: "blogs",
      showInfoFunc: showBlogs.bind(false),
    });
  });
};

searchBar.addEventListener("enter", startForSearch);
searchBtn.addEventListener("click", startForSearch);

categoryMenu.addEventListener("click", startForCategory.bind("option"));
categories.addEventListener("click", startForCategory.bind("category-btn"));

pageBtnsContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("pg-btn")) return;
  movePage(e);
});

nextPageBtn.addEventListener("click", movePage);

// styling a bit:
const loginMassge = document.querySelector("#login-msg");
const registerMessage = document.querySelector("#register-msg");
if (loginMassge && window.innerWidth < 500) {
  loginMassge.innerText = "login here:";
  registerMessage.innerText = "Join:";
}
