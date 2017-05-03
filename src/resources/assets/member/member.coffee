'use strict'


app = angular.module('zack', [ ], angular.noop)

app.controller 'MenberCtrl', ($scope, $http, Checker) ->

    $scope.logined = false
    $scope.auth = null
    $scope.user = { }

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
        else
            window.location.href = '/'

    $http.post('/api/v1/user/info', {
        token: $scope.auth.token or ''
    }).then (res) ->
        _data = if res.data? then res.data else res
        console.log 'userInfo', _data

        if _data.type isnt 'ok'
            window.location.href = '/'
            return

        $scope.user = _data.content

    $scope.action_edit = ->
        data = {
            token : $scope.auth.token
        }
        (data[key] = value) for key, value of $scope.user
        $http.post('/api/v1/update', data).then (resule) ->
            resule = if resule.data? then resule.data else resule
            if resule.type == 'ok'
                $('#myModal-edit').modal('hide')
                location.reload()
            else
                alert(resule.msg)
        return true
