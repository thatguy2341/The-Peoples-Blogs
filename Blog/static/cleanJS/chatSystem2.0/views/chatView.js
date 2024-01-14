"use strict";

import { PopupView } from "../../popupView.js";
import { getTime } from "../../extention.js";

class ChatView extends PopupView {
  _container = document.querySelector("#chat-area");
  #chatBody = document.querySelector("#chat-body");
  #chatMainBtn = document.querySelector("#chat-btn");
  #chatBtn = document.querySelector("#chat-button-title");
  modal = document.querySelector("#chat-modal");
  #friendChatContainer = this.modal.querySelector(".friends");
  #messagesContainer = this.modal.querySelector("#chat");
  #inputContainer = this._container.querySelector(".input-message");
  #input = this.#inputContainer.querySelector(".message-input");
  #friendButton;
  #chosenFriend;

  getChosenFriendData() {
    return this.#chosenFriend.dataset;
  }

  setChosenFriend(friend) {
    this.#chosenFriend = friend;
    this.setFriendBtn(this.#chosenFriend.dataset.friendId);
  }

  setFriendBtn(friendId) {
    this.#friendButton = this.#friendChatContainer.querySelector(
      `.friend-container .friend-row[data-friend-id="${friendId}"]`
    );
  }

  setHead() {
    this._container.querySelector(".message-begin").textContent = ``;
    this._container.querySelector(".chat-title").textContent = `Chat with ${
      this.#chosenFriend.dataset.name
    }`;
    this.#messagesContainer.dataset.id = `${this.#chosenFriend.dataset.id}`;
  }

  scrollToMessage(message, behavior = "smooth") {
    const containerHieght = this.#messagesContainer.scrollHeight;
    const top = message.scrollHeight;
    this.#messagesContainer.scrollTo({
      top: top + containerHieght,
      behavior: behavior,
    });
  }

  showNewMessageFriend(message) {
    const last_message = this.#friendButton.querySelector(`.friend-message`);
    last_message.innerText = message.message;
  }

  showNewMessageChat(message) {
    const newMessage = document.createElement("div");
    newMessage.innerHTML = this.htmlForMessage(message);
    this.#messagesContainer.insertAdjacentElement("beforeend", newMessage);
    this.scrollToMessage(newMessage, "instant");
  }

  showNewMessage(message) {
    //At Friend row:
    this.showNewMessageFriend(message);
    // At chat:
    this.showNewMessageChat(message);
  }

  renderChatBlueprint() {
    // Set the header data:
    this.setHead();
    // Insert input:
    this.#inputContainer.classList.remove("hidden");
  }

  showPastMessages(messages) {
    const lastMessage = this.showData(
      messages,
      this.#messagesContainer,
      this.htmlForMessage
    );

    this.scrollToMessage(lastMessage);
  }

  messagesSpinner() {
    this.#messagesContainer.innerHTML = `<div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  }

  friendsSpinner() {
    this.#friendChatContainer.innerHTML = `
  <div class="spinner-container" style="position: fixed;left: 10%; top: 30%;">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  }

  activateFriend() {
    this.#friendButton = this.#friendChatContainer.querySelector(
      `.friend-container .friend-row[data-friend-id="${
        this.#chosenFriend.dataset.friendId
      }"]`
    );
    this.#friendButton?.classList.add("active");
  }

  showFriends(friends) {
    this.showData(friends, this.#friendChatContainer, this.htmlForFriendsChat, [
      "friend-container",
    ]);
  }

  htmlForFriendsChat(friend) {
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
  }

  htmlForMessage({ message, type, time }) {
    return `
    ${
      type === "s"
        ? `
    <div class="message-container float-right" style='background-color: #C5E898;'>
      <p class="message">${message}</p>
      <span class="float-right message-time">${time}</span>
    </div>
  `
        : `
        <div class="message-container float-left" style='background-color: #87C4FF;'>
        <p class="message">${message}</p>
        <span class="float-right message-time">${time}</span>
      </div>
      `
    }
  `;
  }

  fullScreen() {
    this.#friendChatContainer.classList.add("hidden");
    this._container.classList.remove("col-9");
    this.modal.classList.add("full-screen");
    this._container.querySelector("#chat")?.classList.add("chat-full");
  }

  minimizePopup() {
    this.#friendChatContainer.classList.remove("hidden");
    this._container.classList.add("col-9");
    this.modal.classList.remove("full-screen");
    this._container.querySelector("#chat")?.classList.remove("chat-full");
  }

  clearChat() {
    this.#messagesContainer.dataset.id = "";
    this.#messagesContainer.innerHTML = "";
    this.#inputContainer.classList.add("hidden");
  }

  startChat() {
    this.clearChat();
    this.#chatBody.classList.remove("hidden");
    this.#chatBtn.classList.add("active");
  }

  hideChat() {
    this.#chatBody.classList.add("hidden");
    this.#chatBtn.classList.remove("active");
    this.#friendButton?.remove("active");
  }

  addChatFriendListener(callBackFunc) {
    this.#friendChatContainer.addEventListener(
      "click",
      function (e) {
        if (this.#friendButton) this.#friendButton.classList.remove("active");

        this.#friendButton = e.target.closest(".btn");
        this.#friendButton.classList.add("active");
        this.#chosenFriend = this.#friendButton;
        callBackFunc();
        e.stopPropagation();
      }.bind(this)
    );
  }

  getInputValue() {
    return this.#input.value;
  }
  resetInput() {
    this.#input.value = "";
  }
  focusInput() {
    this.#input.focus();
  }

  showFriendDisconnected(data) {
    this.modal.querySelector(`#online[data-id="${data["id"]}"]`).textContent =
      "🔴";
  }

  showFriendConnected(data) {
    this.modal
      .querySelectorAll(`#online[data-id="${data["id"]}"]`)
      .forEach((element) => {
        element.textContent = "🟢";
      });
  }

  recieveMessage(data) {
    this.setFriendBtn(data.id);
    this.showNewMessageFriend({ message: data.message });
    if (+this.#messagesContainer.dataset.id === data.id)
      this.showNewMessageChat({
        message: data.message,
        time: `${getTime()}`,
        type: "r",
      });
  }

  addInputListeners(sendFunc) {
    const button = this.#inputContainer.querySelector(".btn-input");
    this.#input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        sendFunc();
      }
    });
    button.addEventListener("click", sendFunc);
  }

  addChatButtonsListeners(callBackFunc) {
    this.#chatMainBtn?.addEventListener(
      "click",
      function () {
        callBackFunc(true);
        this.openModal();
      }.bind(this)
    );
    this.#chatBtn.addEventListener("click", callBackFunc);
  }
}

export default new ChatView();
