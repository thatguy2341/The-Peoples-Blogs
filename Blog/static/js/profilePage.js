"use strict";
import { Info } from "./infoSystem.js";

const btnGroup = document.querySelector("[data-button-map]");
const id = +document.querySelector("h1[data-id]").dataset.id;
const infoContainer = document.querySelector("div[data-container-info]");
const blogsInfo = new Info(`/get_blogs_by_user/${id}`);
const postsInfo = new Info(`/get_posts_by_user/${id}`);
const chatInfo = new Info(`/get_user_message/${id}`);
const friendsInfo = new Info(`/get_friends/${userId}`);
const userInfo = new Info(`/get_user/${id}`);
const editButton = document.querySelector("a[data-confirmation]");
const modalBodyInfo = document.querySelector("#edit-modal-body").innerHTML;
const requestButton = document.querySelector("#friend-request");

requestButton?.addEventListener("click", function () {
  fetch(`/send_notification/${this.dataset.id}/friend_req`);
  this.style.display = "none";
});

editButton?.addEventListener("click", function (e) {
  const modal = document.querySelector("#edit-modal");
  modal.classList.add("edit-modal");
  openModal(modal, modalBodyInfo, "");
  e.stopPropagation();
});

const hr = function () {
  return `<hr style=" ${
    infoContainer.dataset.dark === "True"
      ? "border-top: 1px solid rgba(255, 255, 255, 0.5)"
      : "border-top: 1px solid rgb(0 0 0 / 20%)"
  } ;"> `;
};

const htmlForBlogs = function (blog) {
  if (document.querySelector("h1[data-auth]")) {
    return `
    <div class="smooth-scroll">
    ${hr()}
    <div class="post-preview">
    <div class="delete-container">
          <button type="button" data-url="/blog/${blog.id}/delete"
                  data-context="delete your Blog" class="btn btn-delete btn-outline-danger delete-blog float-right">
            Delete
            Post
          </button>
        </div>
        <a href="/get-posts/${blog.id}?raise_view=1">
          <h2 class="post-title" id="post-title">
            ${blog.name}
          </h2>
            <h4 class="post-subtitle">
            ${
              blog.description.length > 64
                ? blog.description.slice(0, 64).replace(/(<([^>]+)>)/gi, "") +
                  "..."
                : blog.description.replace(/(<([^>]+)>)/gi, "")
            }
          </h4>
          </a>
          <div class="row" style="margin-left: 0;">
          <p class="post-meta">Posted by
            <a href="/view_profile/${id}">${blog.author}</a>
            on ${blog.created_date}
          </p>
          <h4 class="views"> ${blog.views} 👁️</h4>
        </div>
      </div>
    </div>`;
  } else {
    return `
    <div class="smooth-scroll">
    ${hr()}
    <div class="post-preview">

        <a href="/get-posts/${blog.id}?raise_view=1">
          <h2 class="post-title" id="post-title">
            ${blog.name}
          </h2>
            <h4 class="post-subtitle">
            ${
              blog.description.length > 64
                ? blog.description.slice(0, 64).replace(/(<([^>]+)>)/gi, "") +
                  "..."
                : blog.description.replace(/(<([^>]+)>)/gi, "")
            }
          </h4>
          </a>
          <div class="row" style="margin-left: 0;">
          <p class="post-meta">Posted by
            <a href="/view_profile/${id}">${blog.author}</a>
            on ${blog.created_date}
          </p>
          <h4 class="views"> ${blog.views} 👁️</h4>
        </div>
      </div>
    </div>`;
  }
};

const htmlForPosts = function (post) {
  if (document.querySelector("h1[data-auth]")) {
    return `
      <div class="smooth-scroll">
      ${hr()} 
      <div class="post-preview">
      <div class="delete-container">
            <button type="button" data-url="/blog/${post.blog_id}/delete/${
      post.id
    }"
                    data-context="delete this Post" class="btn btn-delete btn-outline-danger delete-blog float-right">
              Delete
              post
            </button>
          </div>
          <a href="/blog/post/${post.id}?raise_view=1">
            <h2 class="post-title" id="post-title">
              ${post.title}
            </h2>
              <h4 class="post-subtitle">
              ${
                post.subtitle.length > 64
                  ? post.subtitle.slice(0, 64) + "..."
                  : post.subtitle
              }
            </h4>
            </a>
            <div class="row" style="margin-left: 0;">
            <p class="post-meta">Posted by
              <a href="/view_profile/${id}">${post.author}</a>
              on ${post.date}
            </p>
            <h4 class="views"> ${post.views} 👁️</h4>
          </div>
        </div>
      </div>`;
  } else {
    return `
      <div class="smooth-scroll">
      ${hr()}
      <div class="post-preview">
  
          <a href="/blog/post/${post.id}?raise_view=1">
            <h2 class="post-title" id="post-title">
              ${post.title}
            </h2>
              <h4 class="post-subtitle">
              ${
                post.subtitle.length > 64
                  ? post.subtitle.slice(0, 64) + "..."
                  : post.subtitle
              }
            </h4>
            </a>
            <div class="row" style="margin-left: 0;">
            <p class="post-meta">Posted by
              <a href="/view_profile/${id}">${post.author}</a>
              on ${post.date}
            </p>
            <h4 class="views"> ${post.views} 👁️</h4>
          </div>
        </div>
      </div>`;
  }
};

const htmlForUser = function (user) {
  return `      
    ${hr()}
    <div class="details">
      <div class="row user-details">
        <p class="title-detail">Email:</p>
        <p>${user.email}</p>
      </div>
      ${hr()}
      <div class="row user-details">
        <p class="title-detail">Name:</p>
        <p>${user.name}</p>
      </div>
      ${hr()}
      <div class="row user-details">
        <p class="title-detail">Total views:</p>
        <p>${user.total_views}</p>
      </div>
    </div>`;
};

const showBlogsFunc = function () {
  if (!blogsInfo.infoList) return;
  infoContainer.innerHTML = "";
  blogsInfo.infoList.forEach((blog) =>
    blogsInfo.showInfo({
      htmlBuilder: htmlForBlogs,
      container: infoContainer,
      info: blog,
    })
  );
};

const showPostsFunc = function () {
  if (!postsInfo.infoList) return;
  infoContainer.innerHTML = "";
  postsInfo.infoList.forEach((post) =>
    postsInfo.showInfo({
      htmlBuilder: htmlForPosts,
      container: infoContainer,
      info: post,
    })
  );
};

const showUserFunc = function () {
  if (!userInfo.infoList) return;
  infoContainer.innerHTML = "";

  userInfo.showInfo({
    htmlBuilder: htmlForUser,
    container: infoContainer,
    info: userInfo.infoList,
  });
};

btnGroup.addEventListener("click", function (e) {
  const button = +e.target.dataset.button;
  if (!button) return;

  if (button !== 3) {
    btnGroup
      .querySelectorAll("button")
      .forEach((btn) => btn.classList.remove("active"));

    infoContainer.innerHTML =
      darkMode === "True"
        ? `
        <hr style="border-top: 1px solid rgba(255, 255, 255, 0.5);">
      <div class="spinner-container text-color">
        <div class="spinner-border" role="status">
        <span class="hidden">Loading...</span>
        </div>
      </div>
      `
        : `
    <hr style=" border-top: 1px solid rgb(0 0 0 / 20%) ;">
      <div class="spinner-container">
        <div class="spinner-border text-color" role="status">
        <span class="hidden">Loading...</span>
        </div>
      </div>
      `;

    e.target.classList.add("active");
  }
  switch (button) {
    case 1:
      // blogs case

      blogsInfo
        .getInfo({ dataType: "blogs", showInfoFunc: showBlogsFunc })
        .then(() => {
          addPopup();
        });

      break;

    case 2:
      // posts case
      postsInfo
        .getInfo({ dataType: "posts", showInfoFunc: showPostsFunc })
        .then(() => addPopup());

      break;

    case 3:
      document.querySelector("#chat-btn").click();
      break;

    case 4:
      userInfo.getInfo({ dataType: "user", showInfoFunc: showUserFunc });
      break;
  }
});
