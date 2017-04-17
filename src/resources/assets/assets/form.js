(function(){
'use strict'

$('#ms-login-tab form a').first().bind('click', function(){
  var id_card = $('#ms-login-tab #ms-form-user').first().val();
  var password = $('#ms-login-tab #ms-form-pass').first().val();
  if (id_card.length < 18) {
    // TODO
    alert('身份证至少18位');
    return false;
  }
  if (password.length < 6) {
    alert('密码至少6位');
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
    {key: 'id', leastLength: 18, label: '身份证'},
    {key: 'phone', leastLength: 11, label: '电话'},
    {key: 'pass', leastLength: 6, label: '密码'},
    {key: 'email', match: /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i, label: 'Email'}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (item.leastLength != null && data[item.key].length < item.leastLength) {
      alert(item.label+'至少'+item.leastLength+'位');
      return false;
    }
    if (item.match != null && !item.match.test(data[item.key])) {
      // TODO
      alert(item.label+'格式不匹配');
      return false;
    }
  }
  if (item.pass != item.repass) {
    // TODO
    alert('密码不一致');
    return false;
  }
  $.post('/api/v1/register', {
    "id_card": data.id,
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
        id_card: data.id,
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
    {key: 'user', leastLength: 18, label: '身份证'},
    {key: 'email', match: /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i, label: 'Email'}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (item.leastLength != null && data[item.key].length < item.leastLength) {
      // TODO
      alert(item.label+'至少'+item.leastLength+'位');
      return false;
    }
    if (item.match != null && !item.match.test(data[item.key])) {
      // TODO
      alert(item.label+'格式不匹配');
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
