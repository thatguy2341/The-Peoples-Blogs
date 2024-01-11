"use strict";

import { userId } from "../../js/header.js";

export const getNotifications = async function () {
  try {
    const response = await fetch(`/get_notifications/${userId}`);
    if (!response.ok) throw Error(`could not get notifications`);
    const data = await response.json();
    return data["notifications"];
  } catch (error) {
    console.error(error);
  }
};
