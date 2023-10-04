const href = window.location.href;
const findIndex = href.indexOf("number");
const orderNumber = href.slice(findIndex + 7);

async function getOrderData(orderNumber) {
  const data = await getData2(`/orders/${orderNumber}`, "GET");
  console.log(data);
  renderOrderDetail(data);
}
getOrderData(orderNumber);

function renderOrderDetail(data) {
  const img = document.querySelector("#order-attraction-img");
  img.setAttribute("src", data.attraction_image);
  const contactName = document.querySelector("#contact-name");
  contactName.textContent = data.contact_name;
  const siteName = document.querySelector("#site-name");
  siteName.textContent = data.attraction_name;
  const orderDate = document.querySelector("#order-date");
  orderDate.textContent = data.date;
  const orderTime = document.querySelector("#order-time");
  orderTime.textContent = data.time === "daytime" ? "上午" : "下午";
  const orderNumber = document.querySelector("#order-number");
  orderNumber.textContent = data.order_number;
  const paymentStatus = document.querySelector("#payment-status");
  paymentStatus.textContent =
    data.payment_status === "paid" ? "已付款" : "未付款";
  if (data.payment_status === "paid") {
    paymentStatus.classList.add("paid");
  } else {
    paymentStatus.classList.add("cta");
  }
  const contactPhone = document.querySelector("#contact-phone");
  contactPhone.textContent = data.contact_phone;
  const contactEmail = document.querySelector("#contact-email");
  contactEmail.textContent = data.contact_email;
}

const copyButton = document.getElementById("copyButton");
const textToCopy = document.getElementById("order-number");

copyButton.addEventListener("click", function () {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = textToCopy.textContent;

  document.body.appendChild(tempTextArea);

  tempTextArea.select();
  document.execCommand("copy");

  document.body.removeChild(tempTextArea);
  console.log("複製成功");
  const copySuccessfulText = document.querySelector(".copy-successful");
  copySuccessfulText.style.display = "inline-block";
});
