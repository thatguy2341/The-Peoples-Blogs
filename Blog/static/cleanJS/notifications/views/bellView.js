"use strict";

class BellView {
  element = document.querySelector("#notification-bell");

  addListener(callbackFunc) {
    this.element.addEventListener("click", callbackFunc);
  }

  resetBell() {
    this.element.textContent = "🔔";
  }
}

export default new BellView();
