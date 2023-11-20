"use strict";

import { Info } from "./infoSystem.js";

const chatMainBtn = document.querySelector("#chat-btn");
const friendChatContainer = document.querySelector("#friends");
const notificationBell = document.querySelector("#notification-bell");
const notificationContainer = document.querySelector(
  "#notifications-container"
);
const chatContainer = document.querySelector("#chat-area");
const friendsBody = document.querySelector("#friends-body");
const chatBody = document.querySelector("#chat-body");
const friendsBtn = document.querySelector("#friends-button-title");
const chatBtn = document.querySelector("#chat-button-title");
const friendsInput = document.querySelector("#friends-input");

// NOTIFICATION SYSTEM
const htmlNotifications = function (notification) {
  return `
  <div class="row" id="notification-row">
    <div class="col notification-col">
    ${
      notification.type_ === "message"
        ? `<p id="${notification.id}">${notification.message}</p>
      <a class="close-button delete-btn" data-url="/remove_notification/${notification.id}">&times;</a>`
        : `
        <p id="${notification.id}">${notification.message}
        <a about="send a friend request" id="friend-request" style="cursor: pointer;     margin: 10px;" data-url="/add_friend/${notification.from_id}" 
        data-url-delete="/remove_notification/${notification.id}">👤+</a>
        </p>
        <a class="close-button delete-btn" data-url="/remove_notification/${notification.id}">&times;</a>
        `
    }
    </div>
  </div>
         `;
};

const showNotifications = async function () {
  const notificationInfo = new Info(`/get_notifications/${userId}`);
  await notificationInfo.getInfo({
    dataType: "notifications",
    showInfoFunc: false,
  });
  notificationContainer.innerHTML = "";
  notificationInfo.infoList.forEach((notification) => {
    notificationInfo.showInfo({
      htmlBuilder: htmlNotifications,
      container: notificationContainer,
      info: notification,
    });
  });
};

notificationBell.addEventListener("click", function () {
  const modalNotification = document.querySelector("#notification-modal");

  if (userId == false) {
    openModal(
      modalNotification,
      `<div class="container" style="text-align: center;">To see an notifications log in or register</div>`
    );
  } else {
    showNotifications().then(() => {
      openModal(modalNotification);
      this.textContent = "🔔";
    });
  }
});
notificationContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    fetch(e.target.dataset.url);
    e.target.closest("#notification-row").style.display = "none";
  } else if ((e.target.id = "friend-request")) {
    fetch(e.target.dataset.url).then(() => fetch(e.target.dataset.urlDelete));
    e.target.closest("#notification-row").style.display = "none";
  }
});

// CHAT SYSTEM

const htmlForFriendsChat = function (friend, newSection) {
  newSection.classList.add("friend-container");
  return `
  <button type="button" class="btn btn-outline-secondary friend-row" data-id="${
    friend.id
  }">
  <div class="friend-name"><div class="name">${friend.friend_name}</div> ${
    friend.online ? '<i class="fas">🟢</i>' : '<i class="fas">🔴</i>'
  }
  </div>
  <div class="friend-message text-truncate">${
    friend.last_message ? friend.last_message : ""
  }</div> 
  </button>`;
};

const htmlForChat = function (message) {
  return `
  ${
    message.type === "s"
      ? `
  <div class="message-container float-right" style='background-color: #C5E898;'>
    <p class="message">${message.message}</p>
    <span class="float-right message-time">${message.time}</span>
  </div>
`
      : `
      <div class="message-container float-left" style='background-color: #87C4FF;'>
      <p class="message">${message.message}</p>
      <span class="float-right message-time">${message.time}</span>
    </div>
    `
  }
`;
};

const sendMessage = function (id) {
  fetch(`/send_message/${id}?message=${this.value}`)
    .then((response) => {
      if (!response.ok) throw new Error("failed");
      return response.json();
    })
    .then(() => {
      getChat(id);
    })
    .catch(() => console.log("user not friend"));
  this.value = "";
};

const showChat = function (buttonClicked) {
  const inputContainer = document.createElement("div");
  inputContainer.innerHTML = `
  <div class="input-group input-message">
      <input type="text" class="form-control message-input" placeholder="message">
      <button class="btn btn-success btn-input" type="button" style="padding: 0.375rem 0.75rem;">send
      </button>
   </div>`;
  chatContainer.innerHTML = `
  <div class="chat-title">
    Chat with ${buttonClicked.querySelector(".name").textContent}
  </div>
  <div class="chat overflow-auto" id="chat"> </div>`;

  chatContainer.insertAdjacentElement("afterbegin", inputContainer);

  const input = inputContainer.querySelector(".message-input");
  const button = inputContainer.querySelector(".btn-input");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendMessage.bind(this)(buttonClicked.dataset.id);
    }
  });
  button.addEventListener("click", sendMessage.bind(input));
};

function getChat(id) {
  const chatInfo = new Info(`/get_user_message/${id}`);
  chatInfo
    .getInfo({
      dataType: "messages",
      showInfoFunc: false,
    })
    .then(() => {
      const chat = chatContainer.querySelector("#chat");
      chat.innerHTML = "";
      chatInfo.infoList?.forEach((message) => {
        chatInfo.showInfo({
          htmlBuilder: htmlForChat,
          container: chatContainer.querySelector("#chat"),
          info: message,
        });
      });
      const messages = chat.querySelectorAll(".message-container");
      messages[messages.length - 1].scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    });
}

const showFriends = async function (container, html, id = false) {
  const friendsInfo = new Info(`/get_friends/${userId}`);
  await friendsInfo.getInfo({
    dataType: "friends",
    showInfoFunc: false,
  });
  container.innerHTML = "";
  friendsInfo.infoList?.forEach((friend) => {
    friendsInfo.showInfo({
      htmlBuilder: html,
      container: container,
      info: friend,
    });
    if (id) container.querySelector(`.btn[data-id="${id}"]`).click();
  });
};

friendChatContainer?.addEventListener("click", function (e) {
  const button = e.target.closest(".btn");

  this.querySelectorAll(".btn").forEach((btn) =>
    btn.classList.remove("active")
  );
  button.classList.add("active");
  showChat(button);
  getChat(button.dataset.id);
  e.stopPropagation();
});

const readyChat = function () {
  chatBody.classList.remove("hidden");
  friendsBody.classList.add("hidden");
  chatBtn.classList.add("active");
  friendsBtn.classList.remove("active");
};

const summonChat = function () {
  readyChat();

  if (window.innerWidth < 800) {
    friendChatContainer.closest(".friends").style.display = "none";
    chatContainer.classList.remove("col-9");
    chatContainer.classList.add("col");
  } else {
    friendChatContainer.closest(".friends").style.display = "block";
    chatContainer.classList.add("col-9");
    chatContainer.classList.remove("col");
  }

  return showFriends(friendChatContainer, htmlForFriendsChat);
};

window.addEventListener("resize", function () {
  if (window.innerWidth < 800) {
    friendChatContainer.closest(".friends").style.display = "none";
    chatContainer.classList.remove("col-9");
    chatContainer.classList.add("col");
  } else {
    friendChatContainer.closest(".friends").style.display = "block";
    chatContainer.classList.add("col-9");
    chatContainer.classList.remove("col");
  }
});

const htmlForFriends = function (friend) {
  return `
  <div class="row friends-friend" id="friends-friend">
      <p class="friend-name">${friend.friend_name}
      ${
        friend.online
          ? '<i class="fas" style="padding-left: 1em; font-size: 14px;">🟢</i>'
          : '<i class="fas" style="padding-left: 1em; font-size: 14px;">🔴</i>'
      }
      
      </p>
      <div>
      <a id="open-chat" data-id="${
        friend.friend_id
      }" style="cursor: pointer; margin: 10px;">💬</a>
      <a class="close-button delete-btn" data-url="/remove_friend/${friend.id}" 
      id="remove-friend">👤x</a>
      </div>
  </div>
  `;
};

friendsBtn?.addEventListener("click", function () {
  friendsBtn.style = "";
  friendsBtn.classList.add("active");
  chatBtn.classList.remove("active");

  chatBody.classList.add("hidden");
  friendsBody.classList.remove("hidden");

  const containerFreinds = document.querySelector("#friends-container");
  showFriends(containerFreinds, htmlForFriends);
});

const htmlForUsers = function (user) {
  return `
  <div style="padding: 0 20%;">
  <div class="row friends-friend new-friend" id="friends-friend">
  <p class="friend-name">${user.name}

    </p>
    <a about="send a friend request" id="friend-request" style="cursor: pointer;margin: 10px;" data-url="/send_notification/${user.id}/friend_req">👤+</a>
  </div>
  </div>
  `;
};

const getUsers = function () {
  if (!friendsInput.value) return;
  const usersInfo = new Info(`/get_users/${friendsInput.value}`);
  usersInfo
    .getInfo({
      dataType: "users",
      showInfoFunc: false,
    })
    .then(() => {
      const container = document.querySelector("#friends-container");
      container.innerHTML = "";

      usersInfo.infoList.forEach((user) => {
        usersInfo.showInfo({
          htmlBuilder: htmlForUsers,
          container: container,
          info: user,
        });
      });
    });
};

friendsBody?.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    fetch(e.target.dataset.url);
    e.target.closest("#friends-friend").style.display = "none";
  } else if (e.target.id === "open-chat") {
    readyChat();
    showFriends(friendChatContainer, htmlForFriendsChat, e.target.dataset.id);
  } else if (e.target.id === "friends-submit") {
    getUsers();
  } else if (e.target.id === "friend-request") {
    fetch(e.target.dataset.url);
    e.target.closest("#notification-row").style.display = "none";
  }
  e.stopPropagation();
});

friendsInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getUsers();
  }
});

chatMainBtn?.addEventListener("click", function () {
  const modal = document.querySelector("#chat-modal");
  summonChat().then(() => {
    openModal(modal);
  });
});
chatBtn?.addEventListener("click", summonChat);
