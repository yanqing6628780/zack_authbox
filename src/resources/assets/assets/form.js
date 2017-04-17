(function(){
'use strict'

$('#ms-login-tab form a').first().bind('click', function(){
  var id_card = $('#ms-login-tab #ms-form-user').first().val();
  var password = $('#ms-login-tab #ms-form-pass').first().val();
  if (id_card.length < 18) {
    // TODO
    return false;
  }
  if (password.length < 6) {
    // TODO
    return false;
  }
  $.post('/api/v1/login', {
    id_card: id_card,
    password: password
  }, function (resule) {
    console.log(resule);
    // TODO
    if (resule.type == 'ok') {
      window.location.href = '/member/?token=' + resule.content.token;
      $('.modal .close').first().click();
    }
  });
  return true;
});

$('#ms-register-tab form a').first().bind('click', function(){
  var data = {
    id: $("#ms-register-tab #ms-form-user").first().val(),
    name: $("#ms-register-tab #ms-form-name").first().val(),
    sex: $("#ms-register-tab #inputGen").first().val(),
    phone: $("#ms-register-tab #ms-form-phone").first().val(),
    email: $("#ms-register-tab #ms-form-email").first().val(),
    address: $("#ms-register-tab #ms-form-address").first().val(),
    pass: $("#ms-register-tab #ms-form-pass").first().val(),
    repass: $("#ms-register-tab #ms-form-repass").first().val()
  };
  var CHECK_TABLE = [
    {key: 'id', leastLength: 18},
    {key: 'phone', leastLength: 11},
    {key: 'pass', leastLength: 6},
    {key: 'email', match: /[\w-_]+@[\w-_]\.[\w-_]+/}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (item.leastLength !== null && data[item.key].length < item.leastLength) {
      // TODO
      return false;
    }
    if (item.match !== null && !item.match.test(data[item.key])) {
      // TODO
      return false;
    }
  }
  if (item.pass != item.repass) {
    // TODO
    return false;
  }
  $.post('/api/v1/register', {
    "id_card": data.user,
    "password": data.pass,
    "email": data.email,
    "gender": data.sex == '男' ? 'male' : 'remale',
    "name": data.name,
    "phone": data.phone,
    "address": data.address
  }, function (resule) {
    // TODO
    if (resule.type == 'ok') {
      $.post('/api/v1/login', {
        id_card: data.user,
        password: data.pass
      }, function (resule) {
        // TODO
        if (resule.type == 'ok') {
          window.location.href = '/member/?token=' + resule.content.token;
        }
      });
    }
  });
  return true;
});

$('#ms-recovery-tab form a').first().bind('click', function(){
  var data = {
    user: $("#ms-recovery-tab #ms-form-user").first().val(),
    email: $("#ms-recovery-tab #ms-form-email").first().val()
  };
  var CHECK_TABLE = [
    {key: 'user', leastLength: 18},
    {key: 'email', match: /[\w-_]+@[\w-_]\.[\w-_]+/}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (item.leastLength !== null && data[item.key].length < item.leastLength) {
      // TODO
      return false;
    }
    if (item.match !== null && !item.match.test(data[item.key])) {
      // TODO
      return false;
    }
  }
  $.post('/api/v1/forget', {
    "id_card": data.user,
    "email": data.email
  }, function (resule) {
    // TODO
    if (resule.type == 'ok') {
      $('.modal .close').first().click();
    }
  });
  return true;
});

})();
