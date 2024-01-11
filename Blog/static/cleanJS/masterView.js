"use strict";

const closeModalButtons = document.querySelectorAll("[data-close-button]");

export class View {
  renderSpinner() {
    this._container.innerHTML = `<div class="spinner-container">
    <div class="spinner-border text-color" role="status">
      <span class="hidden">Loading...</span>
    </div>
  </div>`;
  }

  hide() {
    this._container?.classList.add("hidden");
  }

  addSmoothScrolling() {
    const revealSection = function (entries, observer) {
      const [entry] = entries;
      if (entry.isIntersecting) {
        entry.target.classList.remove("section--hidden");
        observer.unobserve(entry.target);
      }
    };

    const observer = new IntersectionObserver(revealSection, {
      root: null,
      threshold: 0.25,
    });
    this._sectionList.forEach((section) => {
      section.classList.add("section--hidden");
      section.classList.add("smooth-scroll");
      observer.observe(section);
    });
  }
  showData(dataArray, addClasses = []) {
    this._container.innerHTML = "";
    dataArray = dataArray || this._sectionList;
    if (!dataArray) {
      this._container.innerHTML = this.error;
    }

    dataArray.forEach((data) => {
      // TODO MAYBE CAN JUST CREATE 1 ELEMENT

      const newSection = document.createElement("div");
      if (addClasses) addClasses.forEach((cl) => newSection.classList.add(cl));
      newSection.innerHTML = this.markUp(data);
      this._container.insertAdjacentElement("beforeend", newSection);
    });
  }
}
