"use strict";

const searchBar = document.querySelector(".bar-search");
const searchBtn = document.querySelector(".btn-search");
const categoryMenu = document.querySelector(".menu");
const selectedCategroy = document.querySelector(".selected");
const blogsContainer = document.querySelector(".blogs-container");
const categories = document.querySelector(".categories-btns-row");
const categoriesBtns = document.querySelectorAll(".category-btn");
SCRIPT_ROOT = SCRIPT_ROOT || "https://the-peoples-blogs.onrender.com/";

class GetInfo {
  #sectionList = [];
  #infoList;
  #search;
  #category;
  #page;

  constructor(link) {
    this.link = link;
  }
  _getCategory(targetCategory) {
    if (categories.classList.contains("categories-btns-disable")) {
      if (!targetCategory) this.#category = selectedCategroy.innerText;
      else this.#category = targetCategory;
    } else {
      if (!targetCategory) this.#category = "Recent";
      else this.#category = targetCategory;
    }
  }

  _getSearch() {
    this.#search = searchBar.value;
  }

  _getPage() {
    fetch("/get_page")
      .then((response) => response.json())
      .then((data) => (this.#page = Number(data["num"])));
  }

  _showBlogs(smoothScroll) {
    blogsContainer.innerHTML = "";
    if (!this.#infoList) {
      blogsContainer.insertAdjacentHTML(
        "afterend",
        `<div style="text-align: center; margin-bottom: 20rem;">
            <p>
                It seems that no posts have loaded 😖
            </p>
        </div>`
      );
    } else {
      this.#infoList
        .slice(this.#page * 10, this.#page * 10 + 10)
        .forEach((blog) => {
          let html = `
            <hr>
            <div class="post-preview" style="font-size: 1.25rem;">
                <a href="${SCRIPT_ROOT}/get-posts/${blog.id}?raise_view=1">

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
                  <a href="${SCRIPT_ROOT}/view_profile/${blog.author_id}">
                    ${blog.author}
                  </a>
                  on ${blog.created_date}
               </p>
               <h4 class="col-lg-2 col-md-2 col-sm-3 views">${blog.views} 👁️</h4>
            </div>
         </div>`;
          const newSection = document.createElement("div");
          newSection.innerHTML = html;
          this.#sectionList.push(newSection);

          blogsContainer.insertAdjacentElement("beforeend", newSection);
        });
      if (smoothScroll) this._addSmoothScrolling();

      blogsContainer.insertAdjacentHTML(
        "beforeend",
        `<hr class="smooth-scroll" style="margin-bottom: 15rem;">`
      );
      if (this.#infoList.length > 9) {
        document.querySelector(".btn-hide").style.display = "none";
      }
    }
  }

  getBlogs({ smoothScroll = false, targetCategory = false }) {
    this._getPage();
    this._getCategory(targetCategory);
    this._getSearch();
    fetch(`${this.link}/${this.#search || "null"}/${this.#category || "null"}`)
      .then(function (response) {
        if (!response.ok) throw `could not find what you searched for`;

        return response.json();
      })
      .then(
        function (data) {
          this.#infoList = data["blogs"];
          this._showBlogs(smoothScroll);
          document.querySelector(".failed-search").textContent = "";
        }.bind(this)
      )
      .catch((error) => {
        document.querySelector(".failed-search").textContent =
          error + ` '${this.#search}'`;
      });
  }

  _addSmoothScrolling() {
    const revealSection = function (entries, observer) {
      const [entry] = entries;
      if (entry.isIntersecting) {
        entry.target.classList.remove("section--hidden");
        observer.unobserve(entry.target);
      }
    };

    const observer = new IntersectionObserver(revealSection, {
      root: null,
      threshold: 0.25,
    });
    this.#sectionList.forEach((section) => {
      section.classList.add("section--hidden");
      section.classList.add("smooth-scroll");
      observer.observe(section);
    });
  }
}

const info = new GetInfo("/get_blogs");

info.getBlogs({ smoothScroll: true });

searchBar.addEventListener("enter", function (e) {
  e.preventDefault();
  info.getBlogs({});
  searchBar.value = "";
});
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  info.getBlogs({});
  searchBar.value = "";
});
categoryMenu.addEventListener("click", function (e) {
  if (e.target.classList.contains("option"))
    info.getBlogs({ targetCategory: e.target.textContent });
});
categories.addEventListener("click", function (e) {
  if (e.target.classList.contains("category-btn"))
    info.getBlogs({ targetCategory: e.target.textContent });
});
