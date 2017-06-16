'use strict'

app = angular.module('cly')

app.controller 'MenberCtrl', ($scope, $rootScope, $http, Checker) ->

    $scope.user = { }

    $http.post('/api/v1/user/info', {
        token: $rootScope.auth.token or ''
    }).then (res) ->
        _data = if res.data? then res.data else res
        console.log 'userInfo', _data

        if _data.type isnt 'ok'
            window.location.href = '/'
            return

        if _data.content.is_ban and confrim('该账号已被禁用')
            $rootScope.action_logout()
            return

        $scope.user = _data.content
        $scope.editUser = _data.content
        # 刷新数据
        ($rootScope.auth[key] = val) for key, val of _data.content

        return

    $scope.action_edit = ->
        data = {
            token : $rootScope.auth.token
        }
        (data[key] = value) for key, value of $scope.editUser
        $http.post('/api/v1/update', data).then (resule) ->
            resule = if resule.data? then resule.data else resule
            if resule.type == 'ok'
                $('#myModal-edit').modal('hide')
                location.reload()
            else
                alert(resule.msg)
        return true

    return
