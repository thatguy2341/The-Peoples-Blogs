'use strict';

// Hover on navlinks effect.
const navBar = document.querySelector('.navbar-collapse');

const makeBold = function (e) {
  if (!e.target.classList.contains('nav-link')) return;

  const links = navBar.querySelectorAll('.nav-link');

  links.forEach(link => {
    if (link !== e.target) link.style.opacity = this;
  });
};

navBar.addEventListener('mouseover', makeBold.bind(0.5));

navBar.addEventListener('mouseout', makeBold.bind(1));

// Dark and Light Mode.
document.documentElement.style.setProperty('--color-darkMode', 'black');
document.documentElement.style.setProperty('--color-darkModeText', 'white');

const body = document.querySelector('body');
const darkModeBtn = document.querySelector('.dark-btn');
const lightModeBtn = document.querySelector('.light-btn');
lightModeBtn.classList.add('hidden');
const btns = document.querySelectorAll('.btn');
const btnsInfo = [...document.querySelectorAll('.btn-info'), ...document.querySelectorAll('.btn-primary')];
const anchors = document.querySelectorAll('a');
const frontImage = document.querySelector('.masthead');
document
  .querySelectorAll('.fas-anchor')
  .forEach(a => (a.style.color = '#212529'));
let imageUrl = frontImage.style.backgroundImage;
let onDarkmode = false;

const darkmode = function (e) {
  e.preventDefault();
  body.classList.add('dark-mode-active');
  btns.forEach(btn => btn.classList.add('btn-outline-light'));
  btnsInfo?.forEach(btn => {btn?.classList.remove('btn-info'); btn?.classList.remove('btn-primary');});
  document.documentElement.style.setProperty('--anchor-color', 'white');

  // Changing the big image.
  frontImage.style.backgroundImage =
    "url('https://miro.medium.com/v2/resize:fit:1400/0*tCccas60oybUjlOK')";

  darkModeBtn.classList.toggle('hidden');
  lightModeBtn.classList.toggle('hidden');
  onDarkmode = true;
};

const lightmode = function (e) {
  e.preventDefault();
  body.classList.remove('dark-mode-active');
  btns.forEach(btn => btn.classList.remove('btn-outline-light'));
  btnsInfo?.forEach(btn => {btn?.classList.add('btn-info'); btn?.classList.add('btn-primary');});

  frontImage.style.backgroundImage = imageUrl;

  document.documentElement.style.setProperty('--anchor-color', '212529');
  darkModeBtn.classList.toggle('hidden');
  lightModeBtn.classList.toggle('hidden');

  onDarkmode = false;
};

darkModeBtn.addEventListener('click', darkmode);
lightModeBtn.addEventListener('click', lightmode);
