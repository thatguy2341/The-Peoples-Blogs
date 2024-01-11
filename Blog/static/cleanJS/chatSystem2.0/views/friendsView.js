"use strict";

import { View } from "../../masterView.js";

class FriendsView extends View {
  _container = document.querySelector("#friends-container");
  #friendsInput = document.querySelector("#friends-input");
  #friendsBtn = document.querySelector("#friends-button-title");
  #friendsBody = document.querySelector("#friends-body");

  markUpUsers(user) {
    return `
      <div style="padding: 0 10%;">
      <div class="row friends-friend new-friend" id="friends-friend">
      <p class="friend-name">${user.name}
    
        </p>
        <a about="send a friend request" id="friend-request" style="cursor: pointer;margin: 10px;" data-url="/send_notification/${user.id}/friend_req">👤+</a>
      </div>
      </div>
      `;
  }

  markUp(friend) {
    return `
    <div class="row friends-friend" id="friends-friend">
        <p class="friend-name">${friend.friend_name}
        ${
          +friend.online
            ? `<i class="fas" id="online" data-id="${friend.friend_id}" style="padding-left: 1em; font-size: 14px;">🟢</i>`
            : `<i class="fas" id="online" data-id="${friend.friend_id}" style="padding-left: 1em; font-size: 14px;">🔴</i>`
        }
        
        </p>
        <div>
        <a id="open-chat" data-friend-id="${friend.id}" data-name="${
      friend.friend_name
    }" data-id="${
      friend.friend_id
    }" style="cursor: pointer; margin: 10px;">💬</a>
        <a class="close-button delete-btn" data-url="/remove_friend/${
          friend.id
        }" 
        id="remove-friend">👤x</a>
        </div>
    </div>
    `;
  }

  hideFriends() {
    this.#friendsBody.classList.add("hidden");
    this.#friendsBtn.classList.remove("active");
  }

  startFriends() {
    this.#friendsBody.classList.remove("hidden");
    this.#friendsBtn.classList.add("active");
  }

  showUsers(users) {
    this._container.innerHTML = "";
    users.forEach((user) => {
      const newSection = document.createElement("div");
      newSection.innerHTML = this.markUpUsers(user);
      this._container.insertAdjacentElement("beforeend", newSection);
    });
  }

  addStarterListener(callBackFunc) {
    this.#friendsBtn.addEventListener("click", callBackFunc);
  }

  getInput() {
    return this.#friendsInput.value;
  }

  resetInput() {
    this.#friendsInput.value = "";
  }

  addInputListener(getUsers) {
    this.#friendsInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        getUsers();
      }
    });
  }

  addBodyListener(sendReq, deleteFriend, getUsers, chatWFriend) {
    this.#friendsBody.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-btn")) {
        deleteFriend(e.target.dataset.url);
        e.target.closest("#friends-friend").style.display = "none";
      } else if (e.target.id === "open-chat") {
        chatWFriend(e.target);
      } else if (e.target.id === "friends-submit") {
        getUsers();
      } else if (e.target.id === "friend-request") {
        sendReq(e.target.dataset.url);
        e.target.closest("#friends-friend").style.display = "none";
      }
      e.stopPropagation();
    });
  }
}

export default new FriendsView();
