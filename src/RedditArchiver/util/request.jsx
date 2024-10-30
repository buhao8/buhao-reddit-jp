//https://stackoverflow.com/questions/48969495/in-javascript-how-do-i-should-i-use-async-await-with-xmlhttprequest
export async function make_request(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url);
    xhr.onload = function () {
      console.log('Success ' + url);
      resolve(xhr);
    };
    xhr.onerror = function () {
      console.log('Failure ' + url);
      reject(xhr);
    };
    console.log("Sending request");
    xhr.send();
  });
}
