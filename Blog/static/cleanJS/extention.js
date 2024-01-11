"use strict";

const date = new Date();

export const getTime = function () {
  const hour = date.getHours() || "00";
  const minutes =
    date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
  return `${hour}:${minutes}`;
};
