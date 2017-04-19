(function(){
'use strict'

var token = null;
$(document).ready(function () {
  var $alipay = $('#alipay');
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
    $('#editForm').find('input').each(function (index, ele) {
      var value = $(ele).val();
      switch (index) {
        case 0:
        value = user.phone;
        break;
        case 1:
        value = user.email;
        break;
        case 2:
        value = user.address;
        break;
      }
      if(value) {
        $(ele).parent().parent().addClass('is-focused').removeClass('is-empty is-focused');
      }
      $(ele).val(value);
    });
    $('#editForm #inputGen').selectpicker('val', user.gender);
    var level = user.level == 1 ? '会员' : '普通用户';
    if(user.level == 0) {
      $alipay.attr('href', '/alipay/?token='+token)
    } else {
      $alipay.parent().hide();
    }
    $('.js-member-level').text(level);
  });
});

$('#myModal-edit .modal-footer a').first().bind('click', function () {
  var _data = {
    gender: $("#myModal-edit .modal-body #inputGen").val(),
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
    {key: 'phone', leastLength: 11, label: '电话'},
    {key: 'password', leastLength: 6, label: '密码'},
    {key: 'email', match: /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i, label: 'Email'}
  ];
  for (var item, i = 0; i < CHECK_TABLE.length; i++) {
    item = CHECK_TABLE[i];
    if (!data[item.key]) continue;
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
  if (data.password && data.password != data.repassword) {
    alert('密码不一致');
    return false;
  }
  data.token = token;
  $.post('/api/v1/update', data, function (resule) {
    if (resule.type == 'ok') {
      $('#myModal-edit').modal('hide');
      location.reload();
    } else {
      alert(resule.msg);
    }
  });
});
})();
