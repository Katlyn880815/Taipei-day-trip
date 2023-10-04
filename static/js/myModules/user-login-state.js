initForLoginState();

let loginState;
let userId;
const btnCta = document.querySelector("#btn-cta") ?? null;
const userNameBlock = document.querySelector("#user-name") ?? null;
const isBookingPage = document.querySelector(".section__cart") ?? null;

async function initForLoginState() {
  const isLogin = await getData2("/user/auth", "GET");
  renderNav(isLogin);
  console.log(isLogin);
  if (isLogin === null) {
    loginState = false;
    const loginBtn = document.querySelector("#login");
    const bookingBtn = document.querySelector("#booking-btn");
    if (btnCta !== null) {
      handleNewBooking();
    } else if (isBookingPage !== null) {
      handlebookingPageLogout();
    }
    loginState = false;
    bookingBtn.addEventListener("click", function (e) {
      e.preventDefault();
      login();
    });
    loginBtn.addEventListener("click", function () {
      login();
    });
  } else {
    loginState = true;
    userId = isLogin.id;
    if (btnCta !== null) {
      handleNewBooking();
    } else if (userNameBlock !== null) {
      userNameBlock.textContent = isLogin["name"];
    }
    handleLogOut();
  }
}

async function handleNewBooking() {
  btnCta.addEventListener("click", async function (e) {
    e.preventDefault();
    if (loginState === false) {
      login();
    } else {
      const href = window.location.href;
      let indexOfAttractionIdInHref = href.lastIndexOf("/");
      indexOfAttractionIdInHref = Number(
        href.slice(indexOfAttractionIdInHref + 1)
      );
      const date = document.querySelector("#date").value;
      const time = document.querySelector("input[name='time']:checked").id;
      const price = time === "daytime" ? 2000 : 2500;
      if (date === "") {
        document.querySelector(".hint__select-date").style.display =
          "inline-block";
        return;
      }
      const reqObj = {
        date,
        time,
        price,
        userId: userId,
        attractionId: indexOfAttractionIdInHref,
      };
      const bulidNewOrder = await getData2("/booking", "POST", reqObj);
      if (bulidNewOrder["ok"]) window.location.href = "/booking";
    }
  });
}

function login() {
  const userLoginBlock = document.querySelector(".user-login");
  console.log(userLoginBlock);
  userLoginBlock.classList.add("show");
  formInit();
  handleSwitch();
  const btnsLogin = document.querySelectorAll(".btn__login");
  btnsLogin.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      checkTheInput(btn);
    });
  });
  const closeLoginBlock = document.querySelector(".icon__close");
  closeLoginBlock.addEventListener("click", function () {
    userLoginBlock.classList.remove("show");
  });
}

function formInit() {
  const formLogin = document.querySelector("#form-login");
  const formRegister = document.querySelector("#form-register");
  const h4El = document.querySelector("#login_title");
  const hint = document.querySelector(".hint");
  const inputEmail = document.querySelector("#login-user-email");
  const inputPassword = document.querySelector("#login-user-password");
  h4El.textContent = "登入會員帳號";
  hint.textContent = "";
  hint.classList.remove("hint__error");
  hint.classList.remove("hint__success");
  formLogin.classList.add("form-active");
  formRegister.classList.remove("form-active");
  inputEmail.value = "";
  inputPassword.value = "";
}

function handleSwitch() {
  const btns = document.querySelectorAll(".btn__switch");
  const formLogin = document.querySelector("#form-login");
  const formRegister = document.querySelector("#form-register");
  const h4El = document.querySelector("#login_title");
  const hint = document.querySelector(".hint");
  btns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log(btn.id);
      hint.textContent = "";
      hint.classList.remove("hint__error");
      hint.classList.remove("hint__success");
      if (btn.id === "btn-switch-register") {
        formLogin.classList.remove("form-active");
        formRegister.classList.add("form-active");
        h4El.textContent = "註冊會員帳號";
      } else {
        h4El.textContent = "登入會員帳號";
        formLogin.classList.add("form-active");
        formRegister.classList.remove("form-active");
      }
    });
  });
}

async function getData2(path, method = "GET", reqObj = {}) {
  const storedToken = localStorage.getItem("token");
  let headers;
  if (storedToken) {
    headers = {
      Authorization: "Bearer " + storedToken,
      "Content-Type": "application/json",
    };
  } else {
    headers = {
      "Content-Type": "application/json",
    };
  }
  // let prefixHttp = "http://35.162.233.114:3000/api";
  let prefixHttp = "http://127.0.0.1:3000/api";
  try {
    let response;
    if (method === "GET") {
      response = await fetch(prefixHttp + path, {
        headers: headers,
      });
    } else {
      response = await fetch(prefixHttp + path, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqObj),
      });
    }
    const jsonData = await response.json();

    return jsonData;
  } catch {
    console.log("Loading fail");
    throw error;
  }
}

function handleBooking(loginState) {
  if (loginState === null) {
    userLoginBlock.classList.add("show");
  }
}
//Rendering navigation
function renderNav(status) {
  const headerNavBar = document.querySelector("#header-nav-bar");
  const btn = document.createElement("a");
  btn.classList.add("header__nav__item");
  if (status === null) {
    btn.setAttribute("id", "login");
    btn.textContent = "登入/註冊";
  } else {
    btn.setAttribute("id", "logOut");
    btn.textContent = "登出帳戶";
  }
  headerNavBar.appendChild(btn);
}

async function checkTheInput(btn) {
  const hintEl = document.querySelector(".hint");
  let checkIsInvalid;
  if (btn.id === "btn-login") {
    const userPassword = document.querySelector("#login-user-password");
    const userEmail = document.querySelector("#login-user-email");
    checkIsInvalid = isUserInputValid(
      userPassword.value,
      userEmail.value,
      null
    );
    if (checkIsInvalid === true) {
      const loginResult = await handleLogin(
        userEmail.value,
        userPassword.value
      );
      if (loginResult === true) {
        handleLoginSucess();
      } else {
        hintEl.textContent = loginResult;
        hintEl.classList.add("hint__error");
      }
    } else {
      hintEl.textContent = checkIsInvalid;
      hintEl.classList.add("hint__error");
    }
    //登入流程
  } else {
    const userPassword = document.querySelector("#register-user-password");
    const userEmail = document.querySelector("#register-user-email");
    const userName = document.querySelector("#register-user-name");
    //註冊流程
    checkIsInvalid = isUserInputValid(
      userPassword.value,
      userEmail.value,
      userName
    );
    console.log(checkIsInvalid);
    if (checkIsInvalid === true) {
      const registerState = await handleRegister(
        userPassword.value,
        userEmail.value,
        userName.value
      );
      console.log(registerState);
      if (registerState.hasOwnProperty("ok")) {
        hintEl.textContent = "Register successfully";
        hintEl.classList.add("hint__success");
      } else {
        hintEl.textContent = registerState.message;
        console.log(registerState.message);
        hintEl.classList.remove("hint__success");
        hintEl.classList.add("hint__error");
      }
    } else {
      hintEl.textContent = checkIsInvalid;
      hintEl.classList.remove("hint__success");
      hintEl.classList.add("hint__error");
    }
  }
}

function isUserInputValid(inputPassword, inputEmail, inputUserName, form) {
  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (form === "register") {
    if (inputUserName === "") {
      return "資料欄位不可為空";
    }
  }
  //如果資料為空
  if (inputPassword === "" || inputEmail === "") {
    console.log("here");
    return "資料欄位不可為空";
  } else if (!email_regex.test(inputEmail)) {
    return "電子郵件格式錯誤";
  } else {
    return true;
  }
}

async function handleRegister(userPassword, userEmail, userName) {
  let obj = {
    name: userName,
    email: userEmail,
    password: userPassword,
  };
  let res = await getData2("/user", "POST", obj);
  return res;
}

async function handleLogin(userEmail, userPassword) {
  const reqObj = {
    email: userEmail,
    password: userPassword,
  };

  const loginReq = await getData2("/user/auth", "PUT", reqObj);
  if (loginReq.hasOwnProperty("ok")) handleLoginSucess(loginReq);
  return loginReq.message;
}

function handleLoginSucess(loginRes) {
  const JWTtoken = loginRes.token;
  localStorage.setItem("token", JWTtoken);
  location.reload();
}

function handleLogOut() {
  const logOutbtn = document.querySelector("#logOut");
  logOutbtn.addEventListener("click", function (e) {
    localStorage.clear();
    location.reload();
  });
}

function handlebookingPageLogout() {
  window.location = "/";
}
