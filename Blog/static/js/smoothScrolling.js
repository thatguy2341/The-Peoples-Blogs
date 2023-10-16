"use strict";

const sections = document.querySelectorAll('.smooth-scroll');

const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (entry.isIntersecting) {
    entry.target.classList.remove("section--hidden");
    observer.unobserve(entry.target);
  }
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.25,
});

sections.forEach((section) => {
  // hide the sections.
  section.classList.add("section--hidden");

  // Observe each section with the same observer.
  sectionObserver.observe(section);
});
