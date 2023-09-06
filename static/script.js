const listMrtContainer = document.querySelector(".list-mrt-bar__list");
const leftBtn = document.querySelector(".btn__left");
const rightBtn = document.querySelector(".btn__right");
const listAttractionsContainer = document.querySelector(".list-attractions");
const searchBar = document.querySelector("#search-bar");
const searchBtn = document.querySelector(".btn__search");

let isLoading = false;
let nextPage;
let keywordOuter;

//First time to load page
window.onload = init();

async function init() {
  const attractionInitData = await getData("/attractions");
  const mrtsInitData = await getData("/mrts");
  Promise.all([attractionInitData, mrtsInitData]).then(
    ([attractions, mrts]) => {
      renderAttractionList(attractions.data);
      nextPage = attractions.nextPage;
      mrts.data.forEach((mrt) => putIntoMrtList(mrt));
      scrollBar([leftBtn, rightBtn]);
      let mrtItems = document.querySelectorAll(
        ".list-mrt-bar__list__item__link"
      );
      mrtItems.forEach((mrt) => {
        mrt.addEventListener("click", function () {
          searchBar.value = mrt.text;
          //initailize
          nextPage = null;
          keywordOuter = null;
          listAttractionsContainer.innerHTML = "";
          document.removeEventListener("scroll", throttle(scroll));
          let path = `/attractions?page=0&keyword=${mrt.text}`;
          //fetch data
          fetchByKeyword(path, mrt.text);
        });
      });
    }
  );
}

//Fix firefox event listener issue
let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

document.addEventListener(
  isFirefox ? "DOMMouseScroll" : "scroll",
  throttle(handleScroll)
);

//scorllBar
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

//Attraction List

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
  return attraction;
}

function renderAttractionList(data) {
  data.forEach((site) => {
    let attractionHtml = putIntoAttractionList(
      site.name,
      site.mrt,
      site.category,
      site.images[0]
    );
    listAttractionsContainer.innerHTML += attractionHtml;
  });
}

//節流
function throttle(callback, time = 500) {
  let timer = null;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      callback.call();
      timer = null;
    }, time);
  };
}

//scroll eventListener callback func
function handleScroll() {
  let clientHeight =
    document.documentElement.clientHeight || document.body.clientHeight;
  let scrollTop = document.documentElement.scrollTop;
  let scrollHeight = document.documentElement.scrollHeight;
  console.log(scrollTop + clientHeight, scrollHeight);
  if (scrollTop + clientHeight + 10 >= scrollHeight) {
    console.log("bottom");
    if (nextPage == null) {
      console.log("資料載入完畢");
      return;
    } else if (keywordOuter !== null && keywordOuter !== undefined) {
      console.log(nextPage);
      handleNextPage(nextPage, keywordOuter);
    } else if (nextPage !== null) {
      handleNextPage(nextPage);
    }
  }
}

async function handleNextPage(page, keyword = "") {
  let path = "";
  if (keyword !== "") {
    path = `/attractions?page=${page}&keyword=${keyword}`;
  } else {
    path = `/attractions?page=${page}`;
  }
  const nextPageData = await getData(path);
  if (nextPage !== null) {
    renderAttractionList(nextPageData.data);
  }
  nextPage = nextPageData.nextPage;
  console.log(nextPageData);
}

//Searching function

searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //initialize
  keywordOuter = null;
  nextPage = null;
  document.removeEventListener("scroll", throttle(handleScroll));
  listAttractionsContainer.innerHTML = "";

  //start to fetch data
  let keyword = searchBar.value;
  console.log(keyword);
  let path = `/attractions?page=0&keyword=${keyword}`;
  fetchByKeyword(path, keyword);
});

async function fetchByKeyword(path, keyword) {
  const dataKeyword = await getData(path);
  if (dataKeyword.data === undefined) {
    listAttractionsContainer.innerHTML = result.message;
    return;
  } else {
    renderAttractionList(dataKeyword.data);
    if (dataKeyword.nextPage !== null) {
      keywordOuter = keyword;
      nextPage = dataKeyword.nextPage;
      document.addEventListener("scroll", throttle(handleScroll));
    }
  }
}

async function getData(path) {
  let prefixHttp = "http://35.162.233.114:3000/api";
  console.log(isLoading);
  if (isLoading === false) {
    isLoading = true;
    try {
      const response = await fetch(prefixHttp + path);
      const jsonData = await response.json();
      isLoading = false;
      return jsonData;
    } catch {
      console.log("Loading fail");
      throw error;
    }
  }
}
