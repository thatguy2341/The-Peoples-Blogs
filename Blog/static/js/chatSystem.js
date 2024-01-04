"use strict";

import { Info } from "./infoSystem.js";

const chatMainBtn = document.querySelector("#chat-btn");
const friendChatContainer = document.querySelector("#friends");
const notificationBell = document.querySelector("#notification-bell");
const notificationContainer = document.querySelector(
  "#notifications-container"
);
const friendsInfo = new Info();
const modal = document.querySelector("#chat-modal");
const chatContainer = document.querySelector("#chat-area");
const friendsBody = document.querySelector("#friends-body");
const chatBody = document.querySelector("#chat-body");
const friendsBtn = document.querySelector("#friends-button-title");
const chatBtn = document.querySelector("#chat-button-title");
const friendsInput = document.querySelector("#friends-input");
const containerFreinds = document.querySelector("#friends-container");
const chatInfo = new Info();
let phone_mode = window.innerWidth < 800;
let chatOpen;
const date = new Date();

const getTime = function () {
  const hour = date.getHours() || "00";
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return `${hour}:${minutes}`;
};

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
  } else if (e.target.id === "friend-request") {
    fetch(e.target.dataset.url).then(() => fetch(e.target.dataset.urlDelete));
    e.target.closest("#notification-row").style.display = "none";
  }
});

// CHAT SYSTEM

const htmlForFriendsChat = function (friend, newSection) {
  newSection.classList.add("friend-container");
  return `
  <button type="button" class="btn btn-outline-secondary friend-row" data-name="${
    friend.friend_name
  }" data-id="${friend.friend_id}" data-friend-id="${friend.id}">
  <div class="friend-name"><div class="name">${friend.friend_name}</div> ${
    friend.online
      ? `<i class="fas" data-id="${friend.friend_id}" id="online">🟢</i>`
      : `<i class="fas" data-id="${friend.friend_id}" id="online">🔴</i>`
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

const sendMessage = function (buttonClicked) {
  if (!phone_mode) {
    const last_message = modal.querySelector(
      `.friend-row[data-id="${buttonClicked.dataset.id}"] .friend-message`
    );
    last_message.innerText = this.value;
  }
  chatInfo.showInfo({
    htmlBuilder: htmlForChat,
    container: chatContainer.querySelector("#chat"),
    info: {
      message: this.value,
      time: `${getTime()}`,
      type: "s",
    },
  });
  socket.emit("send_message", {
    id: buttonClicked.dataset.id,
    message: this.value,
  });
  fetch(`/send_message/${buttonClicked.dataset.friendId}?message=${this.value}`)
    .then((response) => {
      if (!response.ok) throw new Error("failed");
      return response.json();
    })
    .then(() => {
      fetch(`/send_notification/${buttonClicked.dataset.id}/message`);
      chatInfo.link = `/get_user_message/${buttonClicked.dataset.friendId}`;
      chatInfo.getInfo({
        dataType: "messages",
        showInfoFunc: false,
      });
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
    Chat with ${buttonClicked.dataset.name}
  </div>
  <div class="chat overflow-auto" id="chat" data-id="${buttonClicked.dataset.id}"> </div>`;

  chatContainer.insertAdjacentElement("afterbegin", inputContainer);

  const input = inputContainer.querySelector(".message-input");
  const button = inputContainer.querySelector(".btn-input");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendMessage.bind(this)(buttonClicked);
    }
  });
  button.addEventListener("click", function () {
    sendMessage.bind(input)(buttonClicked);
  });
  input.focus();
};

const readyChat = function (buttonRow) {
  chatBody.classList.remove("hidden");
  friendsBody.classList.add("hidden");
  chatBtn.classList.add("active");
  friendsBtn.classList.remove("active");
  if (window.innerWidth > 800 && !buttonRow)
    showFriends(friendChatContainer, htmlForFriendsChat);
  if (window.innerWidth > 800 && !buttonRow)
    showFriends(friendChatContainer, htmlForFriendsChat);
};

const checkSize = function () {
  if (window.innerWidth < 800) {
    friendChatContainer.closest(".friends").style.display = "none";
    chatContainer.classList.remove("col-9");
    modal.classList.add("full-screen");
    chatContainer.querySelector("#chat")?.classList.add("chat-full");
    phone_mode = true;
  } else if (window.innerWidth > 800) {
    friendChatContainer.closest(".friends").style.display = "block";
    chatContainer.classList.add("col-9");
    modal.classList.remove("full-screen");
    chatContainer.querySelector("#chat")?.classList.remove("chat-full");

    if (phone_mode) {
      friendChatContainer.innerHTML = "";
      friendsInfo.infoList?.forEach((friend) => {
        friendsInfo.showInfo({
          htmlBuilder: htmlForFriendsChat,
          container: friendChatContainer,
          info: friend,
        });
      });
      phone_mode = false;
    }
  }
};

const summonChat = function (id = false, buttonRow = false) {
  readyChat(buttonRow);
  checkSize();
  if (id) friendChatContainer.querySelector(`.btn[data-id="${id}"]`)?.click();
};

window.addEventListener("resize", checkSize);

function getChat(buttonClicked) {
  showChat(buttonClicked);
  summonChat(false, buttonClicked.classList.contains("friend-row"));
  summonChat(false, buttonClicked.classList.contains("friend-row"));

  chatInfo.link = `/get_user_message/${buttonClicked.dataset.friendId}`;
  chatContainer.querySelector("#chat").innerHTML = `
  <div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  chatContainer.querySelector("#chat").innerHTML = `
  <div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  chatInfo
    .getInfo({
      dataType: "messages",
      showInfoFunc: false,
    })
    .then(() => {
      chatOpen = buttonClicked.dataset.id;
      chatContainer.querySelector("#chat").innerHTML = ``;
      chatInfo.infoList?.forEach((message) => {
        chatInfo.showInfo({
          htmlBuilder: htmlForChat,
          container: chatContainer.querySelector("#chat"),
          info: message,
        });
      });
      const messages = chatContainer.querySelectorAll(".message-container");
      messages[messages.length - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    });
}

const showFriends = async function (container, html) {
  friendsInfo.link = `/get_friends/${userId}`;
  if (container.id === "friends") {
    container.innerHTML = `
  <div class="spinner-container" style="position: fixed;left: 10%; top: 30%;">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  } else {
    container.innerHTML = `
  <div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  }

  if (container.id === "friends") {
    container.innerHTML = `
  <div class="spinner-container" style="position: fixed;left: 10%; top: 30%;">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  } else {
    container.innerHTML = `
  <div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  }

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
  });
};

friendChatContainer?.addEventListener("click", function (e) {
  const button = e.target.closest(".btn");

  this.querySelectorAll(".btn").forEach((btn) =>
    btn.classList.remove("active")
  );
  button.classList.add("active");
  getChat(button);
  e.stopPropagation();
});

const htmlForFriends = function (friend) {
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
  }" data-id="${friend.friend_id}" style="cursor: pointer; margin: 10px;">💬</a>
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

  showFriends(containerFreinds, htmlForFriends);
});

const htmlForUsers = function (user) {
  return `
  <div style="padding: 0 10%;">
  <div class="row friends-friend new-friend" id="friends-friend">
  <p class="friend-name">${user.name}

    </p>
    <a about="send a friend request" id="friend-request" style="cursor: pointer;margin: 10px;" data-url="/send_notification/${user.id}/friend_req">👤+</a>
  </div>
  </div>
  `;
};

const getUsers = function () {
  if (!friendsInput.value) return showFriends(containerFreinds, htmlForFriends);
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
    getChat(e.target);
  } else if (e.target.id === "friends-submit") {
    getUsers();
  } else if (e.target.id === "friend-request") {
    fetch(e.target.dataset.url);
    e.target.closest("#friends-friend").style.display = "none";
  }
  e.stopPropagation();
});

friendsInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getUsers();
  }
});

chatMainBtn?.addEventListener("click", function () {
  summonChat();
  openModal(modal);
});
chatBtn?.addEventListener("click", summonChat);

socket.on("connected", function (data) {
  modal
    .querySelectorAll(`#online[data-id="${data["id"]}"]`)
    .forEach((element) => {
      element.textContent = "🟢";
    });
});

socket.on("disconnected", function (data) {
  modal
    .querySelectorAll(`#online[data-id="${data["id"]}"]`)
    .forEach((element) => {
      element.textContent = "🔴";
    });
});

socket.on("send_message", function (data) {
  const last_message = modal.querySelector(
    `.friend-row[data-id="${data.id}"] .friend-message`
  );

  if (data.to === userId) {
    last_message.innerText = data.message;
    console.log(chat.dataset.id == data.id);
    if (chat && +chat.dataset.id === data.id)
      chatInfo.showInfo({
        htmlBuilder: htmlForChat,
        container: chatContainer.querySelector("#chat"),
        info: {
          message: data.message,
          time: `${getTime()}`,
          type: "r",
        },
      });
  }
});
