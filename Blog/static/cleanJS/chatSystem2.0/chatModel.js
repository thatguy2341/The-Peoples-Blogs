"use strict";

import { socket } from "../header/headController.js";
import { get, send } from "../extention.js";

export const state = { friends: [], messages: [], users: [] };

export const getFriends = async function (userId) {
  state["friends"] = await get(
    `/get_friends/${userId}`,
    "friends",
    "problem getting friends"
  );
};

export const removeFriend = async function (url) {
  await send(url, `problem removing friend ${url}`);
};

export const sendFriendReq = async function (url) {
  await send(url, `problem sending friend request friend ${url}`);
};

export const getChatMessages = async function ({ friendId }) {
  state["messages"] = await get(
    `/get_user_message/${friendId}`,
    "messages",
    "problem getting chat messages"
  );
};

export const sendMessage = async function (message, { friendId, id }) {
  socket.emit("send_message", {
    id: id,
    message: message,
  });
  await send(
    `/send_message/${friendId}?message=${message}`,
    "problem sending message"
  );
};

export const getUsers = async function (input) {
  state["users"] = await get(
    `/get_users/${input}`,
    "users",
    "failed getting users"
  );
};

export const addSocketListeners = function (
  userId,
  connectCallBack,
  disconnectCallback,
  reciveMessage
) {
  socket.on("connected", connectCallBack);
  socket.on("disconnected", disconnectCallback);
  socket.on("send_message", function (data) {
    if (data.to === userId) {
      reciveMessage(data);
    }
  });
};
