"use strict";

export class Info {
  infoList;
  error;
  #sectionList = [];

  constructor(link) {
    this.link = link;
  }

  showInfo({ htmlBuilder, container, blog }) {
    if (!this.infoList) {
      container.insertAdjacentHTML(
        "afterend",
        `<div style="text-align: center; margin-bottom: 20rem;">
              <p>
                  It seems that no posts have loaded 😖
              </p>
          </div>`
      );
    } else {
      const newSection = document.createElement("div");
      newSection.innerHTML = htmlBuilder(blog);
      this.#sectionList.push(newSection);
      container.insertAdjacentElement("beforeend", this.#sectionList.at(-1));
    }
  }

  getInfo({ dataType = "blogs", showInfoFunc }) {
    return fetch(this.link)
      .then(function (response) {
        if (!response.ok) throw `could not find what you searched for`;

        return response.json();
      })
      .then(
        function (data) {
          this.infoList = data[dataType];
          showInfoFunc && showInfoFunc();
          this.error = "";
        }.bind(this)
      )
      .catch(
        ((error) => {
          this.error = error;
        }).bind(this)
      );
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
    this.#sectionList.forEach((section) => {
      section.classList.add("section--hidden");
      section.classList.add("smooth-scroll");
      observer.observe(section);
    });
  }
}
