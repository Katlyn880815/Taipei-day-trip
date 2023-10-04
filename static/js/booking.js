document.addEventListener("DOMContentLoaded", function () {
  initForBooking();
  isLoaded = true;
});
let userInfo;
let orderInfo;
let isLoaded = false;

async function initForBooking() {
  const getUserInfo = await getData2("/user/auth", "GET");
  const hasOrder = await getData2("/booking", (method = "GET"));
  userInfo = getUserInfo;
  orderInfo = hasOrder;
  handleDeleteAttraction(getUserInfo.id);
  renderInputField(getUserInfo);

  if (hasOrder !== null) {
    renderOrder(hasOrder["data"]);
  } else {
    handleOrderNotFound();
  }
}

function renderInputField(userInfos) {
  const nameField = document.querySelector("#name-booking");
  const emailField = document.querySelector("#email-booking");

  nameField.value = userInfos.name;
  emailField.value = userInfos.email;
}

function renderOrder(orderInfo) {
  const cartBlock = document.querySelector(".cart");
  const formBlock = document.querySelector(".section__booking-form");
  const date = document.querySelector("#booking-date");
  const time = document.querySelector("#booking-time");
  const spending = document.querySelector("#booking-spending");
  const site = document.querySelector("#booking-site");
  const img = document.querySelector("#attraction-img");
  const attractionName = document.querySelector("#attraction_name");
  const totalPrice = document.querySelector("#total-price");
  cartBlock.style.opacity = "1";
  cartBlock.classList.add("found-order");
  formBlock.style.display = "block";
  date.textContent = orderInfo["date"];
  time.textContent = orderInfo["time"] === "daytime" ? "上午" : "下午";
  spending.textContent = orderInfo["price"];
  site.textContent = orderInfo["attraction"]["address"];
  attractionName.textContent = orderInfo["attraction"]["name"];
  totalPrice.textContent = orderInfo["price"] + "元";
  img.setAttribute("src", orderInfo["attraction"]["image"]);
}

function handleOrderNotFound() {
  const hint = document.querySelector("#booking-not-found");
  const cartBlock = document.querySelector(".cart");
  const sectionBookingForm = document.querySelector(".section__booking-form");
  const footer = document.querySelector(".footer");
  hint.style.display = "block";
  cartBlock.style.display = "none";
  sectionBookingForm.style.display = "none";
  footer.style.height = "72.5vh";
}

function handleDeleteAttraction(userId) {
  const btnDelete = document.querySelector("#btn-delete");
  btnDelete.addEventListener("click", async function () {
    const reqObj = {
      userId,
    };
    const isDeleted = await getData2("/booking", "DELETE", reqObj);
    try {
      if (isDeleted["ok"]) {
        location.reload();
      }
    } catch {
      console.log("使用者尚未登入");
    }
  });
}

//fetch
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
  let prefixHttp = "/api";
  // let prefixHttp = "http://127.0.0.1:3000/api";
  try {
    let response;
    if (method === "GET") {
      response = await fetch(prefixHttp + path, {
        headers: headers,
      });
    } else {
      response = await fetch(prefixHttp + path, {
        method: method,
        headers: headers,
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
