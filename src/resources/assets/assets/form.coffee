'use strict'

app = angular.module('zack', [ ], angular.noop)

app.controller 'IndexCtrl', ($scope, $http, Checker) ->

    $scope.logined = false
    $scope.auth = null

    if localStorage.zack?.auth?.token? and
            localStorage.zack?.auth?.id_card?
        # Use Localstroage
        $scope.logined = true
        $scope.auth = localStorage.zack.auth
    else
        # Use Search
        searchs = window.location.search
                .replace(/^\?/, '')
                .split('&');

        search = { };
        for item in searchs
            [key, value] = item.split '='
            search[key] = value
            continue

        if search.token? and search.id_card?
            $scope.logined = true
            $scope.auth = {
                id_card: search.id_card
                token: search.token
            }

    loginFn = (id_card, password) ->

        $http.post('/api/v1/login', {
            id_card: id_card
            password: password
        }).then (res) ->
            _data = if res.data? then res.data else res
            console.log 'login', _data
            return false if _data.type isnt 'ok'
            localStorage.zack ?= { }
            localStorage.zack.auth = _data.content
            _content = _data.content
            window.location.href = """
                member/?token=#{_content.token}&id_card=#{_content.token}
            """
            return true

    $scope.action_login = ->
        data = $scope.login
        return false if not Checker.check data

        loginFn(data.id_card, data.password)

    $scope.action_register = ->
        data = $scope.register
        return false if not Checker.check data

        $http.post('/api/v1/register', {
            'id_card': data.id_card
            'name': data.name
            'gender': data.gender
            'phone': data.phone
            'email': data.email
            'address': data.address
            'password': data.pass
        }).then (res) ->
            _data = if res.data? then res.data else res
            console.log 'register', _data
            return false if _data.type isnt 'ok'
            loginFn(data.id_card, data.password)

    $scope.action_recovery = ->
        data = $scope.recovery
        return false if not Checker.check data

        $http.post('/api/v1/forget', {
            id_card: data.id_card
            email: data.email
        }).then (res) ->
            _data = if res.data? then res.data else res
            console.log 'recovery', _data
            return false if _data.type isnt 'ok'
            # TODO

app.constant 'CHECKSET', {
    'id_card':
        label: '身份证号码'
        length: 18
        match: /^\d{17}[\dX]$/i
    'name':
        label: '姓名'
    'gender':
        label: '性别'
        items: ['male', 'female']
    'phone':
        label: '电话号码'
        length: 11
    'email':
        label: 'E-mail'
        match: ///
            ^
            ([\w-_]+(?:\.[\w-_]+)*)
            @
            ((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+
            \.[a-z]{2,6})
            $
        ///i
    'address':
        label: '地址'
    'pass':
        label: '密码'
        minLength: 6
    'repass':
        label: '两次密码'
        same: 'pass'
}

app.service 'Checker', (CHECKSET) ->
    @check = (obj) ->
        if (not angular.isObject obj) or 0 is (key for key of obj).length
            alert '请填写数据'
            return false
        for key, value of obj when CHECKSET[key]?
            _checkset = CHECKSET[key]
            if not (_checkset.length? and
                    value.length is _checkset.length)
                alert "#{_checkset.label}长度必须为#{_checkset.length}位"
                return false
            if not (_checkset.minLength? and
                    value.length >= _checkset.minLength)
                alert "#{_checkset.label}长度最少#{_checkset.minLength}位"
                return false
            if not (_checkset.maxLength? and
                    value.length <= _checkset.maxLength)
                alert "#{_checkset.label}长度最大#{_checkset.maxLength}位"
                return false
            if not (_checkset.items? and
                    -1 isnt _checkset.items.indexOf value)
                alert "#{_checkset.label}输入值不匹配"
                return false
            if not (_checkset.match? and
                    (new Regex(_checkset.match)).test value)
                alert "#{_checkset.label}格式不对"
                return false
            if not (_checkset.same? and obj[_checkset.same]? and
                    obj[_checkset.same] is value)
                alert "#{_checkset.label}不一致"
                return false

        return true

    return @
