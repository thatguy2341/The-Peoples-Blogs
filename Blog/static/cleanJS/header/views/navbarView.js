"use strict";

import { View } from "../../masterView.js";

class NavbarView extends View {
  #nav = document.getElementById("mainNav");
  _container = this.#nav.querySelector("#navbarResponsive"); //navBar
  #navToggler = this.#nav.querySelector(".navbar-toggler");
  #links = this._container.querySelectorAll(".nav-link");
  #navItems = this.#nav.querySelectorAll(".navbar-nav>li.nav-item>a");
  #navBrand = this.#nav.querySelector(".navbar-brand");
  #startingScroll = window.scrollY; //oldScroll

  setNavbar() {
    if (window.innerWidth < 400) {
      this.#navToggler.innerHTML = '<i class="fas fa-bars"></i>';
    }
    this.topFill();
  }
  topFill() {
    if (
      window.scrollY < this.#startingScroll ||
      (window.scrollY < 100 && window.innerWidth > 992)
    ) {
      this.#nav.style = `  
      border-bottom: 1px solid #e9ecef;
      background-color: #fff;
      border-bottom: 1px solid #e9ecef;`;
      this.#navItems.forEach(
        (item) => (item.style = "color: rgb(0, 0, 0, 0.8)")
      );
      this.#navBrand.style = "color: rgb(0, 0, 0, 0.8)";
    } else {
      this.#nav.style = "";
      this.#navItems.forEach((item) => (item.style = ""));
      this.#navBrand.style = "";
    }
    this.#startingScroll = window.scrollY;
  }

  #makeBold(e) {
    if (!e.target.classList.contains("nav-link")) return;

    this.#links.forEach((link) => {
      if (link !== e.target) link.style.opacity = 0.5;
    });
  }
  #resetOpacity(e) {
    this.#links.forEach((link) => {
      if (link !== e.target) link.style.opacity = 1;
    });
  }

  addResponsiveListener() {
    document.addEventListener("scroll", this.topFill.bind(this));
  }

  addHoverEffect() {
    this._container.addEventListener("mouseover", this.#makeBold.bind(this));
    this._container.addEventListener("mouseout", this.#resetOpacity.bind(this));
  }
}

export default new NavbarView();
