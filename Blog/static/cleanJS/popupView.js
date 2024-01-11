"use strict";

import { View } from "./masterView.js";

export class PopupView extends View {
  modal = document.getElementById("modal");
  overlay = document.getElementById("overlay");
  mast = document.querySelector(".masthead");
  main = document.querySelector(".main-content");
  chatBtn = document.querySelector("#chat-btn");

  openModal(content, url) {
    this.closeAllModals();

    if (!this.modal) return;
    const modalBody = this.modal.querySelector(".modal-body");

    if (content) modalBody.innerHTML = content;
    if (url) modalBody.querySelector("a").href = url;

    this.modal.classList.add("active");
    this.overlay.classList.add("active");
    this.hideIntersectingElements();
  }

  closeModal() {
    if (this.modal == null) return;
    this.modal.classList.remove("active");
    this.overlay.classList.remove("active");
    this.main?.classList.remove("hide");
    this.mast?.classList.remove("opaque");
    this.chatBtn?.classList.remove("hidden");
  }

  closeAllModals() {
    const modalsOpen = document.querySelectorAll(".modal.active");
    modalsOpen.forEach((modalOpened) => closeModal(modalOpened));
  }

  hideIntersectingElements() {
    this.chatBtn?.classList.add("hidden");
    this.main?.classList.add("hide");
    this.mast?.classList.add("opaque");
  }

  fullScreen() {
    this.modal.classList.add("full-screen");
  }

  minimizePopup() {
    this.modal.classList.remove("full-screen");
  }
}
