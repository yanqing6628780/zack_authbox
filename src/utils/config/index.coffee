'use strict'

yaml = require('yaml-config')

module.exports = ->

    obj = { }

    env = if process.env.NODE_ENV == 'production'
        'production'
    else
        'development'

    obj = yaml.readConfig(__dirname + '/../../config/app.yaml', env)

    # 因为会存在node_moudles里面, 所以多了一次`../`
    obj.path = {
        views    : "#{__dirname}/../../#{obj.views ? 'app/views'}/"
        models   : "#{__dirname}/../../#{obj.models ? 'app/models'}/"
        logs     : "#{__dirname}/../../#{obj.logs ? 'logs'}/"
        public   : "#{__dirname}/../../#{obj.public ? 'public'}/"
        resource : "#{__dirname}/../../#{obj.resource ? 'resource'}/"
    }

    return obj
