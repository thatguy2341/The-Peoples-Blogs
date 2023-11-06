"use strict";

const searchBar = document.querySelector(".bar-search");
const searchBtn = document.querySelector(".btn-search");
const categoryMenu = document.querySelector(".menu");
const selectedCategroy = document.querySelector(".selected");
const blogsContainer = document.querySelector(".blogs-container");

class GetInfo {
  #infoList;
  #search;
  #category;
  #page;

  constructor(link) {
    this.link = link;
    this.getBlogs();
  }
  _getCategory() {
    this.#category = selectedCategroy.innerText;
  }

  _getSearch() {
    this.#search = searchBar.value;
  }

  _getPage() {
    fetch("/get_page")
      .then((response) => response.json())
      .then((data) => (this.#page = Number(data["num"])));
  }

  _showBlogs() {
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
            <div class="post-preview smooth-scroll" style="font-size: 1.25rem;">
                <a href="{{ url_for('get_all_posts', blog_id=blog.id, raise_view=1) }}">

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
                  <a href="{{ url_for('profile', user_id=blog.author_id) }}">${blog.author}</a>
                  on ${blog.created_date}
               </p>
               <h4 class="col-lg-2 col-md-2 col-sm-3 views">${blog.views} 👁️</h4>
            </div>
         </div>`;

          blogsContainer.insertAdjacentHTML("beforeend", html);
        });
      blogsContainer.insertAdjacentHTML(
        "beforeend",
        `<hr class="smooth-scroll" style="margin-bottom: 15rem;">`
      );
      if (this.#infoList.length > 9) {
        document.querySelector(".btn-hide").style.display = "none";
      }
    }
  }

  getBlogs() {
    this._getPage();
    this._getCategory();
    this._getSearch();
    fetch(`${this.link}/${this.#search || "null"}/${this.#category || "null"}`)
      .then(function (response) {
        if (!response.ok) throw `could not find`;

        return response.json();
      })
      .then(
        function (data) {
          this.#infoList = data["blogs"];
          this._showBlogs();
          document.querySelector(".failed-search").textContent = "";
        }.bind(this)
      )
      .catch((error) => {
        document.querySelector(".failed-search").textContent =
          error + ` '${this.#search}'`;
      });
  }
}

const info = new GetInfo("/get_blogs");

searchBar.addEventListener("enter", function (e) {
  e.preventDefault();
  info.getBlogs();
});
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  info.getBlogs();
});
categoryMenu.addEventListener("click", function (e) {
  if (e.target.classList.contains("option")) info.getBlogs();
});
