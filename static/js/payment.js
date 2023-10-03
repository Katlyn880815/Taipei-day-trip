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

let inputFieldsStatus = false;
let paymentStatus = false;

eventForCheckInputs();

function eventForCheckInputs() {
  const inputsContainer = document.querySelector(".form__booking__user-infos");
  const inputs = inputsContainer.querySelectorAll("input");
  inputs.forEach((i) => {
    i.addEventListener("input", function () {
      let status = checkUserInfos();
      if (status) {
        console.log("all done");
        inputFieldsStatus = true;
        if (paymentStatus && inputFieldsStatus) switchBtnStatus();
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
      if (paymentStatus && inputFieldsStatus) switchBtnStatus();
      //卡片前六碼
      let bincode = result.card.bincode;
      //卡片後四碼
      let lastfour = result.card.lastfour;
      //發卡銀行
      let issuer = result.card.issuer;
      //發卡銀行中文名稱
      let issuerZh = result.card.issuer_zh_tw;
      //發卡銀行代碼
      let bankId = result.card.bank_id;
      //卡片類別
      let funding = result.card.funding;
      //卡片種類
      let type = result.card.type;
      //卡片等級
      let level = result.card.level;
      //發卡國家
      let country = result.card.country;
      //發卡行國家碼
      let countrycode = result.card.countrycode;
      //交易者ip位置
      let clientIp = result.clientip;
      //信用卡識別碼
      let cardIdentifier = result.card_identifier;
    });
  }
});

function switchBtnStatus() {
  const btnCta = document.querySelector("#btn-booking");
  if (inputFieldsStatus && paymentStatus) {
    btnCta.classList.remove("btn__invalid");
    btnCta.disabled = false;
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
  const userPhone = document.querySelector("#phone-booking").value || null;
  const isPassed = checkUserInfos(userName, userEmail, userPhone);
  let result;
  if (isPassed) {
    let interNum = convertInternationalPhoneNum(userPhone);
    result = {
      ok: true,
      userName,
      userEmail,
      userPhone: interNum,
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

function requestPayment(prime, userName, userEmail, userPhone) {
  const reqObj = {
    prime,
    order: {
      price: 2000,
      trip: {
        date: "",
        time: "",
      },
    },
    contact: {
      name: userName,
      email: userEmail,
      phone: userPhone,
    },
  };
  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(),
  });
}
