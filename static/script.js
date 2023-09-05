//MRTS

const listMrtContainer = document.querySelector(".list-mrt-bar__list");
const leftBtn = document.querySelector(".btn__left");
const rightBtn = document.querySelector(".btn__right");

//scorllBar behavior
function scrollBar(btns) {
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      //get container width - padding
      let width = listMrtContainer.getBoundingClientRect().width - 15;
      btn === leftBtn
        ? listMrtContainer.scrollBy(-width, 0)
        : listMrtContainer.scrollBy(width, 0);
    });
  });
}

//Fetch data
const mrtListPromise = getData("/mrts")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    let list = data.data;
    list.forEach((mrt) => putIntoMrtList(mrt));
    scrollBar([leftBtn, rightBtn]);
  });

//Get data func
function getData(path) {
  let prefixHttp = "http://35.162.233.114:3000/api";
  return new Promise(function (resolve, reject) {
    fetch(prefixHttp + path)
      .then((res) => resolve(res))
      .then((error) => reject(error));
  });
}

//put data into list and render
function putIntoMrtList(mrt) {
  let liEl = document.createElement("li");
  let aEl = document.createElement("a");
  let mrtName = document.createTextNode(mrt);

  liEl.classList.add("list-mrt-bar__list__item");
  aEl.classList.add("list-mrt-bar__list__item__link");
  aEl.appendChild(mrtName);

  liEl.appendChild(aEl);
  listMrtContainer.appendChild(liEl);
}

const listAttractionsContainer = document.querySelector(".list-attractions");

//Attraction List
const attractionsListPromise = getData("/attractions")
  .then((res) => {
    return res.json();
  })
  .then((result) => {
    console.log(result);
    let data = result.data;
    let nextPage = result.nextPage;
    data.forEach((site) => {
      let attractionHtml = putIntoAttractionList(
        site.name,
        site.mrt,
        site.category,
        site.images[0]
      );
    });
  });

function putIntoAttractionList(attractionName, mrt, category, imgUrl) {
  let attraction = `<li class="attractions__item">
  <div class="attractions__item__top-box">
    <img
      src=${imgUrl}
      alt=景點圖片-${attractionName}
      class="attractions__item__top-box__img"
    />
    <h3 class="heading__tertiary attractions__item__top-box__heading">
      ${attractionName}
    </h3>
  </div>
  <div class="attractions__item__bottom-box">
    <span>${mrt}</span>
    <span>${category}</span>
  </div>
</li>`;
  listAttractionsContainer.innerHTML += attraction;
}
