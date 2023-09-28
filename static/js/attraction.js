//getting href
let href = window.location.href;
let indexOfAttractionIdInHref = href.lastIndexOf("/");
indexOfAttractionIdInHref = Number(href.slice(indexOfAttractionIdInHref + 1));

//getting elements
const indicatorBar = document.querySelector(".indicator-bar");
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

let isLoading = false;

//Images carousel
btnsCarousel.forEach((btn) => {
  btn.addEventListener("click", function () {
    //if user clicks btn, the offset variable is determined by which btn user clicks
    //offset variable is used to adding the index of slides
    const offset = btn.dataset.carouselBtn === "next" ? 1 : -1;

    //btn.closest will find the closest parent element which has [data-carousel] property
    //and selecting the container of our slides
    //so slides equl to container of all slides
    const slides = btn.closest("[data-carousel]").querySelector("[data-slide]");

    //activeSlide variable is determined by which slide has [data-active] property from everytime user clicks the button
    const activeSlide = slides.querySelector("[data-active]");

    //newIndex variable will be used to provide the which slide should shown
    //we takes all the slides by using rest operator into an array, and newIndex would be the activeSlide plus offset
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;

    console.log("first:", newIndex);

    //here's need to set a if condition.
    //if newIndex < 0, means the active slide is the first slides, so we actually want to show the final slide for user
    // so newIndex will be the length of slides - 1; which is the finall slide
    if (newIndex < 0) newIndex = slides.children.length - 1;
    console.log("second:", newIndex);

    //if newIndex greater than length of slides.children, means the last one is the finall slide, so newIndex should back to zero, which is the first slide
    if (newIndex >= slides.children.length) newIndex = 0;
    console.log("third:", newIndex);

    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;

    let currentIndicator = document.querySelector(`#indicator_${newIndex}`);
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
  console.log(targetIndicator);
  if (targetIndicator !== null) {
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
  }
});

let selecTimeRadioBtns = document.querySelectorAll('[name="time"]');
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

function generateDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  const dateInput = document.querySelector("#date");
  dateInput.setAttribute("min", formattedDate);
}

generateDate();
