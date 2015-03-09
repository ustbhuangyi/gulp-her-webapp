function ajax(url, cb, data) {
  var xhr = new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      cb(xhr.responseText);
    }
  };
  xhr.open(data ? 'POST' : 'GET', url + '&t=' + ~~(Math.random() * 1e6), true);

  if (data) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(data);
}
