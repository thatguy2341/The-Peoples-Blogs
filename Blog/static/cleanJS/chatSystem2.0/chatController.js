"use strict";

import { getNotifications } from "../notifications/notificationsModel.js";
import {
  getFriends,
  getUsers,
  getChatMessages,
  sendMessage,
  state,
  sendFriendReq,
  removeFriend,
  addSocketListeners,
} from "./chatModel.js";
import notificationView from "../notifications/views/notificationView.js";
import bellView from "../notifications/views/bellView.js";
import chatView from "./views/chatView.js";
import friendsView from "./views/friendsView.js";
import { getTime } from "../extention.js";
import { userId } from "../header/headController.js";

let phone_mode = window.innerWidth < 800;

const controlNotifications = async function () {
  if (!userId) {
    notificationView.openModal(
      `<div class="container" style="text-align: center;">To see an notifications log in or register</div>`
    );
  } else {
    const notifications = await getNotifications();
    notificationView.openModal();
    notificationView.showData(notifications);
    bellView.resetBell();
  }
};

const checkSize = function () {
  if (
    (window.innerWidth < 800 && window.innerHeight < 600) ||
    window.innerHeight < 450
  ) {
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

  if (main === true && !phone_mode) {
    chatView.friendsSpinner();
  }
  if (!phone_mode) {
    await getFriends(userId);

    chatView.showFriends(state["friends"]);
  }
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
  if (!phone_mode) {
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
  friendsView.showData(state["users"], undefined, friendsView.markUpUsers);
};

export const initChat = function () {
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
    chatView.showFriendDisconnected.bind(chatView),
    chatView.recieveMessage.bind(chatView)
  );
  checkSize();
};
