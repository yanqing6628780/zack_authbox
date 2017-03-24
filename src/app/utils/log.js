'use strict';

const log4js = require('log4js');
const configs = require('y-config').getConfig();

log4js.configure({
    appenders: [{
            type: 'console',
            category: "console"
        }, //控制台输出
        {
            type: "dateFile",
            filename: '/log.log',
            pattern: "_yyyy-MM-dd",
            alwaysIncludePattern: false,
            category: 'dateFileLog'
        }, //日期文件格式
        {
            type: "dateFile",
            filename: '/models-log.log',
            pattern: "_yyyy-MM-dd",
            alwaysIncludePattern: false,
            category: 'modelsLog'
        } //数据层文件格式
    ],
    replaceConsole: true, //替换console.log
    levels: {
        dateFileLog: 'INFO',
        modelsLog: 'INFO'
    }
}, { cwd: config.path.logs });

exports.dateLogger = log4js.getLogger('dateFileLog');
exports.modelsLogger = log4js.getLogger('modelsLog');

exports.use = function(app) {
    //页面请求日志, level用auto时,默认级别是WARN
    app.use(log4js.connectLogger(logInfo, { level: 'debug', format: ':method :url' }));
}
