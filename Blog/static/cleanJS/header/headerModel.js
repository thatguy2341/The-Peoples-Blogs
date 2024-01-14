"use strict";

import { userId, darkMode } from "./headController.js";

export const changeModeAtSession = function () {
  fetch(`/change_view/${darkMode ? "1" : "0"}`);
};

export const logoutUser = function () {
  if (userId) fetch("/logout/");
};
