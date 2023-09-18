const listMrtContainer = document.querySelector(".list-mrt-bar__list");
const leftBtn = document.querySelector(".btn__left");
const rightBtn = document.querySelector(".btn__right");
const listAttractionsContainer = document.querySelector(".list-attractions");
const searchBar = document.querySelector("#search-bar");
const searchBtn = document.querySelector(".btn__search");
const loginBtn = document.querySelector("#login");
const loginBox = document.querySelector(".user-login");

let isLoading = false;
let nextPage;
let keywordOuter;

window.onload = init();

const observer = new IntersectionObserver(
  (entries, owner) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("entering viewport");
        observer.unobserve(entry.target);
        if (nextPage === null) {
          console.log("資料載入完畢");
        } else if (keywordOuter !== null && keywordOuter !== undefined) {
          handleNextPage(nextPage, keywordOuter);
        } else {
          handleNextPage(nextPage);
        }
      } else {
        console.log("目標離開viewport");
      }
    });
  },
  {
    threshold: 1,
  }
);

function observeLastElemnet() {
  const lastElement = document.querySelector(".attractions__item:last-child");
  observer.observe(lastElement);
}

async function init() {
  const attractionInitData = await getData("/attractions");
  const mrtsInitData = await getData("/mrts");
  Promise.all([attractionInitData, mrtsInitData]).then(
    ([attractions, mrts]) => {
      renderAttractionList(attractions.data);
      nextPage = attractions.nextPage;
      observeLastElemnet();
      //Mrt bar
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
          let path = `/attractions?page=0&keyword=${mrt.text}`;
          //fetch data
          fetchByKeyword(path, mrt.text);
        });
      });
    }
  );
}

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

function putIntoAttractionList(attractionName, mrt, category, imgUrl, id) {
  let liElement = document.createElement("li");
  liElement.className = "attractions__item";

  let topBox = document.createElement("div");
  topBox.className = "attractions__item__top-box";

  let imgElement = document.createElement("img");
  imgElement.src = imgUrl;
  imgElement.alt = `景點圖片-${attractionName}`;
  imgElement.className = "attractions__item__top-box__img";

  let h3Element = document.createElement("h3");
  let aElement = document.createElement("a");
  aElement.textContent = attractionName;
  aElement.classList.add("attractions__item__top-box__heading__link");
  aElement.setAttribute("href", `http://35.162.233.114:3000/attraction/${id}`);
  h3Element.className = "heading__tertiary attractions__item__top-box__heading";
  h3Element.appendChild(aElement);

  let bottomBox = document.createElement("div");
  bottomBox.className = "attractions__item__bottom-box";

  let spanMrt = document.createElement("span");
  spanMrt.textContent = mrt;

  let spanCategory = document.createElement("span");
  spanCategory.textContent = category;

  topBox.appendChild(imgElement);
  topBox.appendChild(h3Element);
  bottomBox.appendChild(spanMrt);
  bottomBox.appendChild(spanCategory);
  liElement.appendChild(topBox);
  liElement.appendChild(bottomBox);

  return liElement;
}

function renderAttractionList(data) {
  data.forEach((site) => {
    let attractionHtml = putIntoAttractionList(
      site.name,
      site.mrt,
      site.category,
      site.images[0],
      site.id
    );
    listAttractionsContainer.appendChild(attractionHtml);
  });
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
    observeLastElemnet();
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
    listAttractionsContainer.innerHTML = dataKeyword.message;
    return;
  } else {
    renderAttractionList(dataKeyword.data);
    if (dataKeyword.nextPage !== null) {
      keywordOuter = keyword;
      nextPage = dataKeyword.nextPage;
      // document.addEventListener("scroll", throttle(handleScroll));
      observeLastElemnet();
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
      console.log(jsonData);
      isLoading = false;
      return jsonData;
    } catch {
      console.log("Loading fail");
      throw error;
    }
  }
}

//event delegation
listAttractionsContainer.addEventListener(
  "click",
  function (e) {
    let currentElement = e.target;
    let liEl;

    if (currentElement.parentNode.tagName.toLowerCase() !== "li") {
      currentElement = currentElement.parentNode;
    }

    liEl = currentElement.parentNode;
    let href = liEl.querySelector("a").getAttribute("href");
    if (liEl.tagName.toLowerCase() === "li") {
      window.location.href = href;
    }
  },
  false
);

loginBtn.addEventListener("click", function (e) {
  e.preventDefault();
  loginBox.classList.add("show");
  const closeBtn = document.querySelector(".icon__close");
  closeBtn.addEventListener("click", function (e) {
    loginBox.classList.remove("show");
  });

  const form = document.querySelector(".user-login__box__form-login");
  const switchBtn = document.querySelector(".btn__switch");
  const submitLogin = document.querySelector(".btn__login");
  const title = loginBox.querySelector("#login_title");

  switchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    console.log(form.dataset.login);
    if (form.dataset.login === "true") {
      const inputName = document.createElement("input");
      const btnLogin = form.querySelector(".btn__login");
      btnLogin.setAttribute("id", "btn_signup");
      submitLogin.textContent = "註冊帳戶";
      title.textContent = "註冊會員帳號";
      inputName.setAttribute("type", "text");
      inputName.setAttribute("placeholder", "請輸入姓名");
      inputName.classList.add("user-login__box__form-login__input");

      console.log(form.children[0]);
      form.insertBefore(inputName, form.children[0]);
      switchBtn.textContent = "已經有帳戶了？點此登入";
      form.dataset.login = false;
    } else {
      const inputFirst = form.querySelector("input:first-child");
      const btnLogin = form.querySelector(".btn__login");
      btnLogin.setAttribute("id", "btn_login");
      title.textContent = "登入會員帳號";
      inputFirst.remove(inputFirst);
      console.log(inputFirst);
      submitLogin.textContent = "登入帳戶";
      switchBtn.textContent = "還沒有帳戶？點此註冊";
      form.dataset.login = true;
    }
  });
});
