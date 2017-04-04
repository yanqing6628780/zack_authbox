module.exports = function(models) {
    var Model = models.admin_role;

    var exports = {};

    exports.run = function() {
        //admin Add
        var data = [
            {
                name: "admin",
                display_name: "超级管理员",
                add_user: true,
                special_edit_user: true,
                edit_user: true,
                del_user: true,
                review_user: true,
                reset_user_password: true,
                reset_admin_password: true,
                scan_all_user: true
            },
            {
                name: "user",
                display_name: "管理员",
                add_user: true,
                special_edit_user: true,
                edit_user: true
            }
        ]

        Model.bulkCreate(data)
            .then(function(rs) {
                console.log('%s insert success.', rs);
                process.exit();
            })
            .catch(function(err) {
                console.log('insert failed err:');
                console.log(err);
                process.exit();
            });
    }

    return exports;
}
