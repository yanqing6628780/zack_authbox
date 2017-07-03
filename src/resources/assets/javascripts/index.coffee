'use strict'

app = angular.module('cly')

app.controller 'IndexCtrl', ($scope, $rootScope, $http, Checker) ->

    console.log 'IndexCtrl'

    $scope.mode = 'login'

    $scope.changeMode = (mode) ->
        $rootScope.$broadcast 'changeMode', mode
        return true

    $scope.$on 'changeMode', (_, mode) ->
        $scope.mode = mode
        return

    cly = { }
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
            cly ?= { }
            cly.auth = _data.content
            localStorage.setItem 'cly', JSON.stringify cly
            _content = _data.content
            window.location.href = """
                member/?token=#{_content.token}
            """
            return true

    # # # # # Login Start # # # # #

    $scope.action_login = ->
        data = $scope.login
        return false if not Checker.check data

        loginFn(data.id_card, data.pass)

    # # # # # Login End # # # # #

    # # # # # Register End # # # # #

    $scope.action_register = ->
        data = $scope.register
        data.gender ?= 'male'
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
            if _data.type isnt 'ok'
                alert(_data.msg)
                return false
            loginFn(data.id_card, data.pass)

    # # # # # Register End # # # # #

    # # # # # Rocovery Start # # # # #

    $scope.$on 'changeMode', (_, mode) ->
        return if mode isnt 'recovery'
        $scope.recovery = { }
        return

    $scope.action_recovery = ->
        data = $scope.recovery
        return false if not Checker.check data

        postData = {
            id_card: data.id_card
            email: data.email
        }

        if data.token?
            postData['token'] = data.token
            postData['password'] = data.pass

        $http.post('/api/v1/forget', postData).then (res) ->
            _data = if res.data? then res.data else res
            console.log 'recovery', _data
            if _data.type isnt 'ok'
                alert _data.msg
                return false

            if not postData.token?
                $scope.recovery.token = _data.content.token
            else
                loginFn(postData.id_card, postData.password)

    # # # # # Rocovery End # # # # #

    return
