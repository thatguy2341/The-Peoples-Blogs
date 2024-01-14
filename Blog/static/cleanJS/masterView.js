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

  addSmoothScrolling(section) {
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
    section.classList.add("section--hidden");
    section.classList.add("smooth-scroll");
    observer.observe(section);
  }

  /**
   * This is a function that if a view class is built with the correct interface,
   * will render an array of data each element as a section into a container by only recieving the data array.
   * @param {Array} dataArray data to render.
   * @param {Element} [container=this._container] container to render data into.
   * @param {function markUp(data) {return html}} [htmlBuilder=this.markUp] htmlBuilder html to render the data into
   * @param {Array} addClasses (optional) add classes to the outer div of each section
   * @param {Element} [errorContainer=this._container] if error then will insert it to this container.
   * @param {Boolean} [smoothScrolling=false] to add smooth scrolling to the rendered elements.
   * @returns the last section that was rendered into the container.
   */
  showData(
    dataArray,
    container = this._container,
    htmlBuilder = this.markUp,
    addClasses = [],
    errorContainer = container,
    smoothScrolling = false
  ) {
    if (dataArray.length === 0) {
      errorContainer.innerHTML = this.error;
      return;
    }
    container.innerHTML = "";
    errorContainer.innerHTML = "";
    let newSection;
    dataArray.forEach((data) => {
      newSection = document.createElement("div");
      if (addClasses) addClasses.forEach((cl) => newSection.classList.add(cl));
      newSection.innerHTML = htmlBuilder(data);
      container.insertAdjacentElement("beforeend", newSection);
      if (smoothScrolling) this.addSmoothScrolling(newSection);
    });
    return newSection;
  }
}
