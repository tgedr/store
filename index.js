'use strict';
const winston = require('winston');
const commons = require('@jtviegas/jscommons').commons;
const dyndbstore = require('@jtviegas/dyndbstore');
const config = require('./config');
const logger = winston.createLogger(commons.getDefaultWinstonConfig());

const store = {

    entityRetrieval: (app, env, entity, id, callback) => {
        logger.debug("[store|entityRetrieval|in] (%s,%s,%s,%s)", app, env, entity, id);
        let table = commons.getTableNameV4(app, entity, env);
        dyndbstore.getObj(table, id, (e,d) => {
            if(e)
                callback(e);
            else
                callback(null, d);
        });
        logger.debug("[store|entityRetrieval|out]");
    }

    , entitiesRetrieval: (app, env, entity, params, callback) => {
        logger.debug("[store|entitiesRetrieval|in] (%s,%s,%s,%o)", app, env, entity, params);
        let table = commons.getTableNameV4(app, entity, env);

        let startId = params && params.startId ? params.startId : 0;
        let rangeSize = params && params.rangeSize ? params.rangeSize : config.DEFAULT_RETRIEVAL_SIZE;
        dyndbstore.findObjsFromId (table, startId, rangeSize, (e,d) => {
            if(e)
                callback(e);
            else
                callback(null, d);
        });
        logger.debug("[store|entitiesRetrieval|out]");
    }

};

module.exports = store;
