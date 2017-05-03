'use strict'

app = angular.module('zack', [ ], angular.noop)

app.controller 'IndexCtrl', ($scope, $http, Checker) ->

    $scope.logined = false
    $scope.auth = null

    zack = if localStorage.getItem('zack')?
        JSON.parse localStorage.getItem 'zack'
    else
        null
    if zack?.auth?.token? and
            zack?.auth?.id_card?
        # Use Localstroage
        $scope.logined = true
        $scope.auth = zack.auth
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
            if _data.type isnt 'ok'
              alert _data.msg
              return false
            zack ?= { }
            zack.auth = _data.content
            localStorage.setItem 'zack', JSON.stringify zack
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
