initForLoginState();

async function initForLoginState() {
  const isLogin = await getData("/user/auth");
  renderNav(isLogin);
  handleLoginBlock(isLogin);
}

async function getData(path) {
  // let prefixHttp = "http://35.162.233.114:3000/api";
  let prefixHttp = "http://127.0.0.1:3000/api";
  try {
    const response = await fetch(prefixHttp + path);
    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData;
  } catch {
    console.log("Loading fail");
    throw error;
  }
}

//Rendering navigation
function renderNav(status) {
  const headerNavBar = document.querySelector("#header-nav-bar");
  const btn = document.createElement("a");
  btn.classList.add("header__nav__item");
  if (status === null) {
    btn.setAttribute("id", "btn-login");
    btn.textContent = "登入/註冊";
  } else {
    console.log("here");
    btn.setAttribute("id", "btn-logOut");
    btn.textContent = "登出帳戶";
  }
  headerNavBar.appendChild(btn);
}

//handle render login block
function handleLoginBlock(status) {
  let btn;
  if (status === null) {
    btn = document.querySelector("#btn-login");
  } else {
    btn = document.querySelector("#btn-logOut");
  }
  btn.addEventListener("click", function () {
    if (btn.id === "btn-login") {
      renderLoginBox();
      btnSwitchEvent();
      const closeBtn = document.querySelector(".icon__close");
      closeBtn.addEventListener("click", function () {
        loginBox.classList.remove("show");
      });
    } else {
      //handle logOut
    }
  });
}

function renderLoginBox() {
  loginBox.classList.add("show");
  const form = document.querySelector("[data-login]");
  const heading = document.querySelector("#login_title");
  const btnSwitch = document.querySelector(".btn__switch");
  const btnCta = document.querySelector("#btn-action");
  if (form.dataset.login === "false") {
    heading.textContent = "註冊會員帳號";
    const userName = document.createElement("input");
    userName.setAttribute("type", "text");
    userName.setAttribute("placeholder", "請輸入姓名");
    userName.setAttribute("id", "user-name");
    userName.setAttribute("name", "user-name");
    userName.classList.add("user-login__box__form-login__input");
    form.insertBefore(userName, form.children[0]);
    btnCta.textContent = "註冊會員";
    btnSwitch.textContent = "已經有帳戶了？點此登入";
  } else {
    heading.textContent = "登入會員帳號";
    btnSwitch.textContent = "還沒有帳戶？點此註冊";
  }
}

function btnSwitchEvent() {
  const btnSwitch = document.querySelector(".btn__switch");
  btnSwitch.addEventListener("click", function (e) {
    e.preventDefault();
    const form = document.querySelector("[data-login]");
    if (form.dataset.login == "false") {
      form.dataset.login = true;
      const userName = document.querySelector("#user-name");
      userName.remove(userName);
      renderLoginBox();
    } else {
      form.dataset.login = false;
      renderLoginBox();
    }
  });
}

function handleLogout() {}
