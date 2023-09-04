//MRTS

const list_mrt = document.querySelector(".list-mrt-bar__list");

const mrtList = get_data("/mrts").then((res) => console.log(res));

function get_data(url) {
  let prefixHttp = "http://35.162.233.114:3000/api";
  let obj = {};
  return new Promise(function (resolve, reject) {
    fetch(prefixHttp + url, Object)
      .then((res) => resolve(res))
      .then((error) => reject(error));
  });
}
