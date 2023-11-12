"use strict";

// Confirmation system:

const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");
const buttons = document.querySelectorAll("button[data-context]");

const openModal = function (modal, content, url) {
  if (modal == null) return;

  const modalBody = modal.querySelector(".modal-body");
  modalBody.insertAdjacentHTML(
    "afterbegin",
    `<div>Are you sure you want to ${content}? </div>`
  );
  modalBody.querySelector("a").href = url;

  modal.classList.add("active");
  overlay.classList.add("active");
  document.querySelector(".main-content")?.classList.add("hide");
};

const closeModal = function (modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
  document.querySelector(".main-content")?.classList.remove("hide");
  modal.querySelector(".modal-body div").innerHTML = "";
};

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

frontImage?.addEventListener("click", () => {
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

const hide = function () {};

buttons.forEach((btnDanger) => {
  console.log(btnDanger);
  // if (
  //   !btnDanger.classList.contains("btn-danger") &&
  //   !btnDanger.classList.contains("btn-outline-danger")
  // )
  // return;

  btnDanger.addEventListener("click", function () {
    const modal = document.querySelector(this.dataset?.modalTarget ?? "#modal");
    openModal(modal, this.dataset.context, this.dataset.url);
  });
});
