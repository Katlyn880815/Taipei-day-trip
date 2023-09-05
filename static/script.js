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

document.addEventListener("scroll", throttle(scroll));

const listMrtContainer = document.querySelector(".list-mrt-bar__list");
const leftBtn = document.querySelector(".btn__left");
const rightBtn = document.querySelector(".btn__right");
const listAttractionsContainer = document.querySelector(".list-attractions");

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
        console.log(mrt.text);
        //initailize
        nextPage = null;
        keywordOuter = null;
        listAttractionsContainer.innerHTML = "";
        document.removeEventListener("scroll", throttle(scroll));
        //fetch data
        getData(`/attractions?page=0&keyword=${mrt.text}`)
          .then((res) => {
            return res.json();
          })
          .then((result) => {
            renderAttractionList(result.data, mrt.text);
            if (result.nextPage !== null) {
              keywordOuter = keyword;
              nextPage = result.nextPage;
              document.addEventListener("scroll", throttle(scroll));
            }
          });
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
//拿到第一筆資料之後，把nextPage指派給全域變數
//1.註冊事件監聽scroll
//2.只要一滑動頁面到底部，就會再去拿第n筆資料，根據全域變數的nextPage去拿
//3.如果nextPage = none就代表沒資料了，把事件監聽取消？

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
function throttle(callback, time = 1000) {
  let timer;
  return function () {
    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      callback();
      timer = null;
    }, time);
  };
}

function scroll() {
  let clientHeight =
    document.documentElement.clientHeight || document.body.clientHeight;
  let scrollTop = document.documentElement.scrollTop;
  let scrollHeight = document.documentElement.scrollHeight;
  console.log(scrollTop + clientHeight, scrollHeight);
  if (scrollTop + clientHeight + 10 >= scrollHeight) {
    console.log("bottom");
    if (nextPage == null) {
      console.log("資料載入完畢");
    } else if (keywordOuter !== null && keywordOuter !== undefined) {
      console.log(nextPage);
      handleNextPage(nextPage, keywordOuter);
    } else {
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
      nextPage = result.nextPage;
      renderAttractionList(result.data);
    });
}

//Searching function

const searchBar = document.querySelector("#search-bar");
const searchBtn = document.querySelector(".btn__search");

searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //initialize
  keywordOuter = null;
  nextPage = null;
  document.removeEventListener("scroll", throttle(scroll));
  listAttractionsContainer.innerHTML = "";

  //start to fetch data
  let keyword = searchBar.value;
  let path = `/attractions?page=0&keyword=${keyword}`;
  getData(path)
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      console.log(result.data);
      renderAttractionList(result.data);
      if (result.nextPage !== null) {
        keywordOuter = keyword;
        nextPage = result.nextPage;
        document.addEventListener("scroll", throttle(scroll));
      }
    });
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
