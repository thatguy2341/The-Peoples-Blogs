"use strict";

import { PopupView } from "../../popupView.js";

class NotificatioView extends PopupView {
  _sectionList = [];
  error = `<div class="container" style="text-align: center;">No notifications found</div>`;
  _container = document.querySelector("#notifications-container");
  modal = document.getElementById("notification-modal");

  setNotifications(data) {
    this._sectionList = data;
  }

  htmlForNotLoggin() {
    return `<div class="container" style="text-align: center;">To see an notifications log in or register</div>`;
  }

  markUp(notification) {
    return `
        <div class="row" id="notification-row">
          <div class="col notification-col">
          ${
            notification.type_ === "message"
              ? `<p id="${notification.id}">${notification.message}</p>
            <a class="close-button delete-btn" data-url="/remove_notification/${notification.id}">&times;</a>`
              : `
              <p id="${notification.id}">${notification.message}
              <a about="send a friend request" id="friend-request" style="cursor: pointer;     margin: 10px;" data-url="/add_friend/${notification.from_id}" 
              data-url-delete="/remove_notification/${notification.id}">👤+</a>
              </p>
              <a class="close-button delete-btn" data-url="/remove_notification/${notification.id}">&times;</a>
              `
          }
          </div>
        </div>
               `;
  }

  addListener() {
    this._container.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-btn")) {
        fetch(e.target.dataset.url);
        e.target.closest("#notification-row").style.display = "none";
      } else if (e.target.id === "friend-request") {
        fetch(e.target.dataset.url).then(() =>
          fetch(e.target.dataset.urlDelete)
        );
        e.target.closest("#notification-row").style.display = "none";
      }
    });
  }
}

export default new NotificatioView();
