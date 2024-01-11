"use strict";

import { getNotifications } from "./notifications/notificationsModel.js";
import {
  getFriends,
  getUsers,
  getChatMessages,
  sendMessage,
  state,
  sendFriendReq,
  removeFriend,
  addSocketListeners,
} from "./chatSystem2.0/chatModel.js";
import notificationView from "./notifications/views/notificationView.js";
import bellView from "./notifications/views/bellView.js";
import chatView from "./chatSystem2.0/views/chatView.js";
import friendsView from "./chatSystem2.0/views/friendsView.js";
import { userId } from "./../js/header.js";
import { getTime } from "./extention.js";

let phone_mode = window.innerWidth < 800;

const controlNotifications = async function () {
  if (!userId) {
    notificationView.openModal(
      `<div class="container" style="text-align: center;">To see an notifications log in or register</div>`
    );
  } else {
    const notifications = await getNotifications();
    notificationView.setNotifications(notifications);
    notificationView.openModal();
    notificationView.showData();
    bellView.resetBell();
  }
};

const checkSize = function () {
  if (window.innerWidth < 750 || window.innerHeight < 500) {
    chatView.fullScreen();
    phone_mode = true;
  } else {
    chatView.minimizePopup();

    if (phone_mode) {
      chatView.showFriends(state["friends"]);
      phone_mode = false;
    }
  }
};

const renderChatPopup = async function (main) {
  chatView.startChat();
  friendsView.hideFriends();

  if (main === true && window.innerWidth > 800) {
    chatView.friendsSpinner();
  }
  await getFriends(userId);

  chatView.showFriends(state["friends"]);
};

const getChat = async function () {
  chatView.renderChatBlueprint();
  chatView.messagesSpinner();
  await getChatMessages(chatView.getChosenFriendData());
  chatView.showPastMessages(state["messages"]);
};

const sendMessageControl = function () {
  const message = chatView.getInputValue();
  if (!message) return;
  chatView.resetInput();
  chatView.focusInput();
  chatView.showNewMessage({ message: message, type: "s", time: getTime() });
  sendMessage(message, chatView.getChosenFriendData());
};

const startFriendsSection = async function () {
  chatView.hideChat();
  friendsView.startFriends();
  friendsView.renderSpinner();
  await getFriends(userId);
  friendsView.showData(state["friends"]);
};

const chatWFriend = function (friendData) {
  friendsView.hideFriends();
  chatView.setChosenFriend(friendData);
  chatView.startChat();
  if (window.innerWidth > 800) {
    chatView.showFriends(state["friends"]);
    chatView.activateFriend();
  }
  getChat();
};

const constrolGetUsers = async function () {
  friendsView.renderSpinner();
  const input = friendsView.getInput();
  if (!input) return friendsView.showData(state["friends"]);
  await getUsers(input);
  friendsView.resetInput();
  friendsView.showUsers(state["users"]);
};

const init = function () {
  window.addEventListener("resize", checkSize);
  bellView.addListener(controlNotifications);
  notificationView.addListener();
  chatView.addInputListeners(sendMessageControl);
  chatView.addChatButtonsListeners(renderChatPopup);
  chatView.addChatFriendListener(getChat);
  friendsView.addStarterListener(startFriendsSection);
  friendsView.addBodyListener(
    sendFriendReq,
    removeFriend,
    constrolGetUsers,
    chatWFriend
  );
  friendsView.addInputListener(constrolGetUsers);
  addSocketListeners(
    userId,
    chatView.showFriendConnected.bind(chatView),
    chatView.showFriendDisconnect.bind(chatView),
    chatView.recieveMessage.bind(chatView)
  );
  checkSize();
};
init();
