module.exports = (() => {
    var obj = {};

    obj.getIDCardAge = (ic) => {
        var myDate = new Date();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - ic.substring(6, 10) - 1;
        if (ic.substring(10, 12) < month || ic.substring(10, 12) == month && ic.substring(12, 14) <= day) {
            age++;
        }
        return age;
    };
    return obj;
})();
