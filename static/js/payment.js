let inputFieldsStatus = false;
let paymentStatus = false;
let prime;
eventForCheckInputs();

TPDirect.setupSDK(
  137039,
  "app_5TDQeua2rQsVcKLj0oY0YyVDDrIBBpgZctYIOnvHiX9ADRibl1To9r4eWtKk",
  "sandbox"
);

TPDirect.card.setup({
  fields: {
    number: {
      element: "#tp-card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: "#tp-exp-date",
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#tp-cvv",
      placeholder: "CVV",
    },
  },
  styles: {
    ":focus": {
      color: "black",
    },
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
  },
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 0,
    endIndex: 11,
  },
});

function eventForCheckInputs() {
  const inputsContainer = document.querySelector(".form__booking__user-infos");
  const inputs = inputsContainer.querySelectorAll("input");
  inputs.forEach((i) => {
    i.addEventListener("input", function () {
      let status = checkUserInfos();
      if (status) {
        console.log("all done");
        inputFieldsStatus = true;
        if (paymentStatus && inputFieldsStatus) {
          switchBtnStatus(orderInfo.data);
        }
      } else {
        inputFieldsStatus = false;
        switchBtnStatus();
        console.log("有欄位未填");
      }
    });
  });
}

TPDirect.card.onUpdate(function (update) {
  if (update.hasError) {
    console.log("有欄位錯誤");
    paymentStatus = false;
    switchBtnStatus();
  }
  console.log(update.status.number);
  if (update.status.number === 3) {
    paymentStatus = false;
    switchBtnStatus();
  }
  if (update.canGetPrime) {
    paymentStatus = true;
    TPDirect.card.getPrime(function (result) {
      if (paymentStatus && inputFieldsStatus) {
        prime = result.card.prime;
        switchBtnStatus(orderInfo.data);
      }
    });
  }
});

async function switchBtnStatus(orderInfo) {
  const btnCta = document.querySelector("#btn-booking");
  if (inputFieldsStatus && paymentStatus) {
    btnCta.classList.remove("btn__invalid");
    btnCta.disabled = false;
    btnCta.addEventListener("click", async function () {
      const reqObj = generate_request_obj(prime, orderInfo);
      const result = await getData2("/orders", "POST", reqObj);
      console.log(result);
      handlePaymentResult(result);
    });
  } else {
    btnCta.classList.add("btn__invalid");
    btnCta.disabled = true;
  }
}

function getPrimeToken(btn, result) {
  btn.addEventListener("click", function () {
    const checkInputs = getUserInfos();
    if (checkInputs.ok) {
      if (result.status !== 0) {
        console.error("getPrime error");
        return false;
      }
      let prime = result.card.prime;
      console.log("getPrime success: " + prime);
      return prime;
    } else {
      return false;
    }
  });
}

function getUserInfos() {
  const userName = document.querySelector("#name-booking").value || null;
  const userEmail = document.querySelector("#email-booking").value || null;
  let userPhone = document.querySelector("#phone-booking").value || null;
  const isPassed = checkUserInfos(userName, userEmail, userPhone);
  let result;
  if (isPassed) {
    userPhone = convertInternationalPhoneNum(userPhone);
    result = {
      ok: true,
      userName,
      userEmail,
      userPhone,
    };
    console.table(result);
    return result;
  } else {
    result = {
      ok: false,
    };
    return result;
  }
}

function checkUserInfos() {
  const reForPhone = /^09\d{2}\d{6}$/;
  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const userName = document.querySelector("#name-booking").value || null;
  const userEmail = document.querySelector("#email-booking").value || null;
  const userPhone = document.querySelector("#phone-booking").value || null;
  if (userName === null || userEmail === null || userPhone === null) {
    return false;
  } else {
    let phoneIsPassed = reForPhone.test(userPhone);
    let emailIsPassed = email_regex.test(userEmail);
    if (phoneIsPassed && emailIsPassed) return true;
    return false;
  }
}

function convertInternationalPhoneNum(originNum) {
  originNum = originNum.replace(/^0/, "");
  let interNum = "+886" + originNum;
  return interNum;
}

function generate_request_obj(prime, orderInfo) {
  const userInfos = getUserInfos();
  const reqObj = {
    prime,
    order: {
      price: orderInfo.price,
      trip: {
        attraction: {
          id: orderInfo.attraction.id,
          name: orderInfo.attraction.name,
          address: orderInfo.attraction.address,
          image: orderInfo.attraction.image,
        },
        date: orderInfo.date,
        time: orderInfo.time,
      },
    },
    contact: {
      name: userInfos.userName,
      email: userInfos.userEmail,
      phone: userInfos.userPhone,
    },
  };
  console.table(reqObj);
  return reqObj;
}

function handlePaymentResult(result) {
  let orderNumber;
  let errorMsg;
  try {
    const data = result.data;
    orderNumber = data.number;
    window.location.href = `/thankyou?number=${orderNumber}`;
    console.log(orderNumber);
  } catch {
    errorMsg = result.message;
    if (errorMsg === "使用者電子信箱或手機號碼填寫錯誤，或姓名未填寫") {
      const hintText = document.querySelector(".hint__invalid-info");
      hintText.style.display = "inline-block";
    }
  }
}
