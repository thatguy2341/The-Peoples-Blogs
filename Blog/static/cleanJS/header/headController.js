"use strict";

import headerView from "./views/headerView.js";
import navbarView from "./views/navbarView.js";
import viewMode from "./views/viewMode.js";
import { changeModeAtSession, logoutUser } from "./headerModel.js";

export const socket = io({ autoConnect: false });
export let darkMode = viewMode.getMode();
export const userId = Number(headerView._container.dataset.id);
socket.connect(document.domain + ":" + location.port);

const controlViewModeSwitch = function () {
  darkMode = !darkMode;
};

const init = function () {
  headerView.setPageProperties(darkMode);
  headerView.addDisconnectListeners(logoutUser);
  headerView.addProgressProtectionListener();
  navbarView.setNavbar();
  navbarView.addHoverEffect();
  navbarView.addResponsiveListener();
  viewMode.addViewListeners(
    controlViewModeSwitch,
    headerView.lazyLoadPicture,
    changeModeAtSession
  );
};

init();
