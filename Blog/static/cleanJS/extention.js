"use strict";
import { TIMEOUTSECONDS } from "./config.js";

const date = new Date();

export const getTime = function () {
  const hour = date.getHours() || "00";
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return `${hour}:${minutes}`;
};

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * sends a get request to the server api.
 * @param {string} link to send to the api.
 * @param {string} type  of data to recieve.
 * @param {string} error to show in the console if there is a probelm.
 * return data
 */
export const get = async function (link, type, error) {
  try {
    const response = await Promise.race([fetch(link), timeout(TIMEOUTSECONDS)]);
    if (!response.ok) throw new Error(error);
    const data = await response.json();
    return data[type];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * sends data to the server api.
 * @param {string} link to send to the api.
 * @param {string} error to show in the console if there is a probelm.
 */
export const send = async function (link, error) {
  try {
    const response = await Promise.race([fetch(link), timeout(TIMEOUTSECONDS)]);
    if (!response.ok) throw new Error(error);
  } catch (error) {
    console.error(error);
  }
};

/**
 * changes a word so only the first letter is upper cased.
 * @param {string} str one word
 * @returns titled word
 */
export const toTitle = function (str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
};
