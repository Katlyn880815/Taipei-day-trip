//First time to load page
window.onload = init();

function init() {
  getData("/attractions")
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      renderAttractionList(result.data, "init");
      nextPage = result.nextPage;
    });
}

document.addEventListener("scroll", throttle(handleScroll));

const listMrtContainer = document.querySelector(".list-mrt-bar__list");
const leftBtn = document.querySelector(".btn__left");
const rightBtn = document.querySelector(".btn__right");
const listAttractionsContainer = document.querySelector(".list-attractions");
const searchBar = document.querySelector("#search-bar");
const searchBtn = document.querySelector(".btn__search");

let nextPage;
let keywordOuter;

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

//Fetch data - mrts
getData("/mrts")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    let list = data.data;
    list.forEach((mrt) => putIntoMrtList(mrt));
    scrollBar([leftBtn, rightBtn]);
    let mrts = document.querySelectorAll(".list-mrt-bar__list__item__link");
    mrts.forEach((mrt) => {
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
  });

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

function handleNextPage(page, keyword = "") {
  let path = "";
  if (keyword !== "") {
    path = `/attractions?page=${page}&keyword=${keyword}`;
  } else {
    path = `/attractions?page=${page}`;
  }
  getData(path)
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if (nextPage !== null) {
        renderAttractionList(result.data);
      }
      nextPage = result.nextPage;
      console.log(nextPage);
      console.log(result);
    });
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
  let path = `/attractions?page=0&keyword=${keyword}`;
  fetchByKeyword(path, keyword);
});

function fetchByKeyword(path, keyword) {
  getData(path)
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if (result.data == undefined) {
        listAttractionsContainer.innerHTML = result.message;
        return;
      }
      renderAttractionList(result.data);
      if (result.nextPage !== null) {
        keywordOuter = keyword;
        nextPage = result.nextPage;
        console.log(result.nextPage);
        document.addEventListener("scroll", throttle(handleScroll));
      }
    });
}

//Get data func
function getData(path) {
  let prefixHttp = "http://35.162.233.114:3000/api";
  return new Promise(function (resolve, reject) {
    fetch(prefixHttp + path)
      .then((res) => resolve(res))
      .then((error) => reject(error));
  });
}
