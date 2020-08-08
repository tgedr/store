'use strict';

const winston = require('winston');
const commons = require('@jtviegas/jscommons').commons;
const logger = winston.createLogger(commons.getDefaultWinstonConfig());

const store = require('@jtviegas/dyndbstore');
const expect = require('chai').expect;
const index = require("..");

const ENTITY = 'item';
const ENV = 'development';
const TEST_ITERATIONS = 6;
const APP = 'app';

describe('index tests', function() {

    this.timeout(50000);
    let table = commons.getTableNameV4(APP, ENTITY, ENV);

    before(function(done) {

        if ( ! process.env['AWS_ACCESS_KEY_ID'] )
            done( 'must provide env var AWS_ACCESS_KEY_ID' );
        if ( ! process.env['AWS_SECRET_ACCESS_KEY'] )
            done( 'must provide env var AWS_SECRET_ACCESS_KEY' );
        if ( ! process.env['DYNDBSTORE_TEST_ENDPOINT'] )
            done( 'must provide env var DYNDBSTORE_TEST_ENDPOINT for the test' );

        let items = [];
        let i = 0;
        while (i < (TEST_ITERATIONS)){
            items.push( {'id': i, 'description': 'xpto' + i, 'category': 'a' + i} );
            i++;
        }

        let loader = function(table, items, callback){
            let f = function() {
                store.putObjs(table, items, (e) => {
                    if(e)
                        callback(e);
                    else
                        callback(null);
                });
            };
            return {f: f};
        }(table, items, done);

        store.createTable(table, (e) => {
            if(e)
                done(e);
            else
                loader.f();
        });
        logger.info("[before|out]");
    });
    
    describe('...pagination', function(done) {
        it('should get all objects', function(done) {

            index.entitiesRetrieval(APP, ENV, ENTITY,null, (e,d)=>{
                logger.info("entitiesRetrieval: %s", d);
                if(e)
                    done(e);
                else {
                    expect(d.length).to.equal(TEST_ITERATIONS);
                    done(null);
                }
            });

        });    

    });
    
     describe('...obj getter', function(done) {
        it('should get a specific item', function(done) {
            index.entityRetrieval( APP, ENV, ENTITY, 2, (e,d)=>{
                logger.info("entityRetrieval: %s", d);
                if(e)
                    done(e);
                else {
                    expect(d).to.eql({'id': 2, 'description': 'xpto' + 2, 'category': 'a' + 2});
                    done();
                }
            });
        });
    });

});
