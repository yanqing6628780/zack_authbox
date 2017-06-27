'use strict'

app = angular.module('cly')

app.controller 'MenberCtrl', ($scope, $rootScope, $http, $timeout, Checker) ->

    $scope.user = { }

    $http.post('/api/v1/user/info', {
        token: $rootScope.auth.token or ''
    }).then (res) ->
        _data = if res.data? then res.data else res
        console.log 'userInfo', _data

        if _data.type isnt 'ok'
            $scope.action_logout()
            return

        if _data.content.is_ban and confrim('该账号已被禁用')
            $rootScope.action_logout()
            return

        $scope.user = _data.content
        $scope.editUser = _data.content
        delete $scope.editUser.password
        # 刷新数据
        ($rootScope.auth[key] = val) for key, val of _data.content

        return

    $scope.action_edit = ->
        data = {
            token : $rootScope.auth.token
        }
        (data[key] = value) for key, value of $scope.editUser
        delete data.id
        if (data.pass)
            data.password = data.pass
        $http.post('/api/v1/update', data).then (resule) ->
            resule = if resule.data? then resule.data else resule
            if resule.type == 'ok'
                if resule.content
                    _c = { }
                    {
                        token: _c.token,
                        id: _c.id
                    } = _data.content
                    window.location.href = """
                        member/?token=#{_c.token}
                    """
                $('#myModal-edit').modal('hide')
                location.reload()
            else
                if (resule.msg)
                    alert(resule.msg)
                else
                    alert('当前会话超时')
                    $timeout( ->
                        window.location.href = "/"
                    , 1000)
        return true

    return
