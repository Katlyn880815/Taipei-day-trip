// Attractions.html
let href = window.location.href;
let indexOfAttractionIdInHref = href.lastIndexOf("/");
indexOfAttractionIdInHref = Number(href.slice(indexOfAttractionIdInHref + 1));
let indicatorBar = document.querySelector(".indicator-bar");

let isLoading = false;

const btnsCarousel = document.querySelectorAll("[data-carousel-btn]");
const carousel = document.querySelector("[data-slide]");
const txtBoxOfAttractionInfo = document.querySelector(
  ".attraction-booking-box__txt"
);
const sectionDescription = document.querySelector(
  ".section__attraction-description"
);
const attractionDescriptionBoxes = document.querySelectorAll(
  ".attraction-description-box"
);

btnsCarousel.forEach((btn) => {
  btn.addEventListener("click", function () {
    const offset = btn.dataset.carouselBtn === "next" ? 1 : -1;
    const slides = btn.closest("[data-carousel").querySelector("[data-slide]");
    const activeSlide = slides.querySelector("[data-active");
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;
    if (newIndex < 0) newIndex = slides.children.length - 1;
    if (newIndex >= slides.children.length) newIndex = 0;

    console.log(slides.children[newIndex]);
    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;

    let currentIndicator = document.querySelector(`#indicator_${newIndex}`);
    console.log(currentIndicator);
    let activeIndicator = document.querySelector("[data-indicator]");
    currentIndicator.dataset.indicator = true;
    delete activeIndicator.dataset.indicator;
  });
});

//fetch
async function getData(path) {
  let prefix = "http://35.162.233.114:3000/api";
  if (!isLoading) {
    isLoading = true;
    try {
      const response = await fetch(prefix + path);
      const responseDataJson = await response.json();
      return responseDataJson;
    } catch {
      console.log("Loading fail");
      throw error;
    }
  }
}

async function getCertainData(id) {
  let result = await getData(`/attraction/${id}`);
  console.log(result);
  return result.data;
}

async function render(id) {
  let data = await getCertainData(id);
  let imgArr = await data.images;

  //Image box
  for (const [index, element] of imgArr.entries()) {
    let liEl = document.createElement("li");
    let imgEl = document.createElement("img");
    //indicator
    let indicator = document.createElement("label");
    if (index === 0) {
      liEl.setAttribute("data-active", "true");
      console.log(liEl);
      indicator.setAttribute("data-indicator", "true");
    }
    liEl.classList.add("attraction-img-box__img-list__slide");
    liEl.setAttribute("id", `img_${index}`);
    imgEl.setAttribute("src", element);
    imgEl.setAttribute("alt", `景點圖片-${data.name}-${index}`);
    imgEl.classList.add("attraction-img-box__img-list__slide__img");
    liEl.appendChild(imgEl);
    carousel.appendChild(liEl);

    indicator.classList.add("indicator-bar__indicator");
    indicator.setAttribute("id", `indicator_${index}`);
    indicatorBar.appendChild(indicator);
  }

  //attraction details
  let h4El = document.createElement("h4");
  let pEl = document.createElement("p");
  let titleTxtNode = document.createTextNode(data.name);
  let mrtAndCategoryTxtNode = document.createTextNode(
    `${data.category} at ${data.mrt}`
  );

  h4El.classList.add("heading__forth");
  pEl.classList.add("attraction-booking-box__txt__description");
  h4El.appendChild(titleTxtNode);
  pEl.appendChild(mrtAndCategoryTxtNode);
  txtBoxOfAttractionInfo.appendChild(h4El);
  txtBoxOfAttractionInfo.appendChild(pEl);

  //description
  let descriptionPEl = document.createElement("p");
  descriptionPEl.classList.add("attraction-description");
  let descriptionTxtNode = document.createTextNode(data.description);
  descriptionPEl.appendChild(descriptionTxtNode);
  sectionDescription.insertBefore(
    descriptionPEl,
    attractionDescriptionBoxes[0]
  );
  //address
  let addressPEl = document.createElement("p");
  let addressTxtNode = document.createTextNode(data.address);
  addressPEl.appendChild(addressTxtNode);
  attractionDescriptionBoxes[0].appendChild(addressPEl);

  //transport
  let transportPEl = document.createElement("p");
  let transportTxtNode = document.createTextNode(data.transport);
  transportPEl.appendChild(transportTxtNode);
  attractionDescriptionBoxes[1].appendChild(transportPEl);
}

indicatorBar.addEventListener("click", function (e) {
  let targetIndicator = e.target.getAttribute("id");
  let li = e.target;
  let activeIndicator = document.querySelector("[data-indicator]");
  console.log(li);
  if (li !== activeIndicator) {
    li.dataset.indicator = true;
    delete activeIndicator.dataset.indicator;
  }

  let indexOfId = targetIndicator.lastIndexOf("_");
  let indicatorId = Number(targetIndicator.slice(indexOfId + 1));

  let targetImg = document.querySelector(`#img_${indicatorId}`);
  let activeSlide = document.querySelector("[data-active]");
  if (targetImg !== activeSlide) {
    targetImg.dataset.active = true;
    delete activeSlide.dataset.active;
  }
});

let selecTimeRadioBtns = document.querySelectorAll('[name="time"]');
console.log(selecTimeRadioBtns);
selecTimeRadioBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    let priceElement = document.querySelector("#price");

    if (btn.getAttribute("id") === "daytime") {
      priceElement.textContent = "導覽費用：新台幣2000元";
    } else {
      priceElement.textContent = "導覽費用：新台幣2500元";
    }
  });
});

render(indexOfAttractionIdInHref);
