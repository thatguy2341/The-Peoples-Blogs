"use strict";

// Confirmation system:

const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");
const mast = document.querySelector(".masthead");

const openModal = function (modal, content, url) {
  const modalsOpen = document.querySelectorAll(".modal.active");
  document.querySelector("#chat-btn")?.classList.add("hidden");
  modalsOpen.forEach((modalOpened) => closeModal(modalOpened));

  if (modal == null) return;
  const modalBody = modal.querySelector(".modal-body");

  if (content) modalBody.innerHTML = content;
  if (url) modalBody.querySelector("a").href = url;

  modal.classList.add("active");
  overlay.classList.add("active");
  document.querySelector(".main-content")?.classList.add("hide");
  mast?.classList.add("opaque");
};

const closeModal = function (modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
  document.querySelector(".main-content")?.classList.remove("hide");
  mast?.classList.remove("opaque");
  document.querySelector("#chat-btn")?.classList.remove("hidden");
};

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

mast?.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});
const addPopup = function () {
  const buttons = document.querySelectorAll("button[data-context]");

  buttons.forEach((btnDanger) => {
    btnDanger.addEventListener("click", function () {
      const modal = document.querySelector(
        this.dataset?.modalTarget ?? "#modal"
      );
      openModal(
        modal,
        `Are you sure you want to ${this.dataset.context}?` +
          '<a class="btn btn-outline-success float-right confirmation-btn">Yes</a>',
        this.dataset.url
      );
    });
  });
};
addPopup();
