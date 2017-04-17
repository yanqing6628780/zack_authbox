(function(){
'use strict'

var token = null;
$(document).ready(function () {
  var searchs = window.location.search.replace(/^\?/, '').split('&');

  if (searchs.length === 0) {
    return window.location.href = '/';
  }

  var search = { };
  for (var item, i = 0; i < searchs.length; i++) {
    item = searchs[i];
    var arr = item.split('=');
    search[arr[0]] = arr[1] || null;
  }

  token = search.token;

  if (token == null) {
    return window.location.href = '/';
  }

  $.post('/api/v1/user/info', {
    token: token
  }, function (resule) {
    if (resule.type != 'ok') {
      return window.location.href = '/';
    }
    var user = resule.content;
    $('.card p').each(function (index, ele) {
      var text = $(ele).text();
      switch (index) {
        case 0:
        text = text.replace('12345678901234567X', user.id_card);
        break;
        case 1:
        text = text.replace('李大明', user.name);
        break;
        case 2:
        text = text.replace('男', user.gender == 'male' ? '男': '女');
        break;
        case 3:
        text = text.replace('30', user.age);
        break;
        case 4:
        text = text.replace('12345678901', user.phone);
        break;
        case 5:
        text = text.replace('XXXXX@126.com', user.email);
        break;
        case 6:
        text = text.replace('广东省佛山市顺德区容桂街道18巷8号', user.address);
        break;
      }
      $(ele).text(text);
    });
  });
});

$('#myModal-edit .modal-footer a').first().bind('click', function () {
  var _data = {
    sex: $("#myModal-edit .modal-body #inputGen").val(),
    phone: $("#myModal-edit .modal-body #ms-form-phone").val(),
    email: $("#myModal-edit .modal-body #ms-form-email").val(),
    address: $("#myModal-edit .modal-body #ms-form-address").val(),
    password: $("#myModal-edit .modal-body #ms-form-pass").val(),
    repassword: $("#myModal-edit .modal-body #ms-form-repass").val()
  };
  var data = { };
  for (var key in _data) {
    if(_data[key].length > 0) {
      data[key] = _data[key];
    }
  }
  var CHECK_TABLE = [
    {key: 'phone', leastLength: 11},
    {key: 'password', leastLength: 6},
    {key: 'email', match: /[\w-_]+@[\w-_]\.[\w-_]+/}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (!data[item.key]) continue;
    if (item.leastLength !== null && data[item.key].length < item.leastLength) {
      // TODO
      return false;
    }
    if (item.match !== null && !item.match.test(data[item.key])) {
      // TODO
      return false;
    }
  }
  if (data.password && data.password != data.repassword) {
    return false;
  }
  $.post('/api/v1/update', data, function (resule) {
    if (resule.type == 'ok') {
      $('$myModal-edit .modal-header .close').click();
    }
  });
});
})();
