"use strict";

// import { socket } from "../../js/header.js";

export const state = { friends: [], messages: [], users: [] };
const timeoutSeconds = 15;

export const getFriends = async function (userId) {
  await get(`/get_friends/${userId}`, "friends", "problem getting friends");
};

export const removeFriend = async function (url) {
  await send(url, `problem removing friend ${url}`);
};

export const sendFriendReq = async function (url) {
  await send(url, `problem sending friend request friend ${url}`);
};

export const getChatMessages = async function ({ friendId }) {
  await get(
    `/get_user_message/${friendId}`,
    "messages",
    "problem getting chat messages"
  );
};

export const sendMessage = async function (message, { friendId, id }) {
  // socket.emit("send_message", {
  //   id: id,
  //   message: message,
  // });
  await send(
    `/send_message/${friendId}?message=${message}`,
    "problem sending message"
  );
};

export const getUsers = async function (input) {
  await get(`/get_users/${input}`, "users", "failed getting users");
};

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const get = async function (link, type, error) {
  try {
    const response = await Promise.race([fetch(link), timeout(timeoutSeconds)]);
    if (!response.ok) throw new Error(error);
    const data = await response.json();
    state[type] = data[type];
  } catch (error) {
    console.error(error);
  }
};

const send = async function (link, error) {
  try {
    const response = await Promise.race([fetch(link), timeout(timeoutSeconds)]);
    if (!response.ok) throw new Error(error);
  } catch (error) {
    console.error(error);
  }
};

export const addSocketListeners = function (
  userId,
  connectCallBack,
  disconnectCallback,
  reciveMessage
) {
  //   socket.on("connected", connectCallBack);
  //   socket.on("disconnected", disconnectCallback);
  //   socket.on("send_message", function (data) {
  //     if (data.to === userId) {
  //       reciveMessage(data);
  //     }
  //   });
};
