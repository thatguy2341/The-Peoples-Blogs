"use strict";

import { View } from "../../masterView.js";

class SearchView extends View {
  _container = document.querySelector(".blogs-container");
  #errorContainer = document.querySelector(".failed-search");
  _buttonSelected;
  error = "could not get blogs, check intenet connection";
  #loginMassge = document.querySelector("#login-msg");
  #registerMessage = document.querySelector("#register-msg");

  changeMessages() {
    if (this.#loginMassge && window.innerWidth < 600) {
      this.#loginMassge.innerText = "login here:";
      this.#registerMessage.innerText = "Join:";
    } else if (this.#loginMassge) {
      this.#loginMassge.innerText =
        "If you already have an account, login here:";
      this.#registerMessage.innerText =
        "Click register, to create a new account:";
    }
  }

  /**
   * gets the page the user is currently on.
   * @returns (Number) an index.
   */
  getPage() {
    return +this._buttonSelected.dataset.num;
  }

  showBlogs(blogs, smoothScrolling = false, search = "") {
    this.error = `could not get any blogs ${
      search ? `for the search: '${search}'` : ""
    }. check internet and try again`;
    this.showData(
      blogs,
      undefined,
      undefined,
      undefined,
      this.#errorContainer,
      smoothScrolling
    );
  }

  markUp(blog) {
    let html = `
            <hr class='smooth-scroll hor-line'>
              <div class="post-preview" style="font-size: 1.25rem;">
                  <a href="/get-posts/${blog.id}?raise_view=1">
                  <div class="title-views">
                  <h1 class="post-title text-truncate" id="post-title">
                    ${blog.name}
                  </h1>
                  <h4 class="views">${blog.views} 👁️</h4>
                  </div>`;

    html += `<h4 class="post-subtitle text-truncate">
                  ${blog.description}
               </h4>`;

    html += `</a>
              <div class="row">
                 <p class="post-meta col">Created by
                    <a href="/view_profile/${blog.author_id}">${blog.author}</a>
                    on ${blog.created_date}
                 </p>
                 
              </div>
           </div>`;

    return html;
  }
}

export default new SearchView();
