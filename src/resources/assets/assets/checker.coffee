'use strict'

app = angular.module('zack')

app.constant 'CHECKSET', {
    'id_card':
        label: '身份证号码'
        match: ///
            ^\d{6}
            (19|20)\d{2} # 年份
            (0[1-9]|1[0-2]) # 月份
            ([0-2][1-9]|3[0-1]) # 日期
            \d{3}[\dX]$
        ///i
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
            if _checkset.length? and
                    value.length isnt _checkset.length
                alert "#{_checkset.label}长度必须为#{_checkset.length}位"
                return false
            if _checkset.minLength? and
                    value.length < _checkset.minLength
                console.log value
                alert "#{_checkset.label}长度最少#{_checkset.minLength}位"
                return false
            if _checkset.maxLength? and
                    value.length > _checkset.maxLength
                alert "#{_checkset.label}长度最大#{_checkset.maxLength}位"
                return false
            if _checkset.items? and
                    -1 is _checkset.items.indexOf value
                alert "#{_checkset.label}输入值不匹配"
                return false
            if _checkset.match? and
                    not (_checkset.match.test value)
                alert "#{_checkset.label}格式不对"
                return false
            if _checkset.same? and obj[_checkset.same]? and
                    obj[_checkset.same] isnt value
                alert "#{_checkset.label}不一致"
                return false

        return true

    return @
