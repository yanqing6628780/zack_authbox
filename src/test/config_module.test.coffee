'use strict'

describe 'Config Module Test Units', ->

    config = null

    afterEach ->
        config = null
        return

    it 'NODE_ENV is production', ->
        process.env.NODE_ENV = 'production'
        config = do require 'authbox-config'
        config.should.have.property('db')
            .which.have.properties ['name', 'host']
        config.should.have.property 'port'
        config.should.have.property 'path'
            .which.have.properties [ 'views', 'models'
                'logs', 'public', 'resource' ]
        return

    it 'NODE_ENV is development', ->
        process.env.NODE_ENV = 'development'
        config = do require 'authbox-config'
        config.should.have.property('db')
            .which.have.properties ['name', 'host']
        config.should.have.property 'port'
        config.should.have.property 'path'
            .which.have.properties [ 'views', 'models'
                'logs', 'public', 'resource' ]
        return
