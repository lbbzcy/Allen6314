var express = require('express');
var request = require('request');
var async = require('async');
var Config = require('../../../../config/globalconfig.js');

var config = new Config();
var router = express.Router();

var Logger = require('../../../../config/logconfig.js');
var logger = new Logger().getLogger();

router.get('/get-articles-by-tag',function(req,res,next){

    logger.debug("visitor/v2/learning/tag.js -- /visitor/tag/get-articles-by-tag ...");
    logger.debug("id = " + req.query.id);

    async.waterfall([
            //请求 主页文章 数据
            function(callback){
                request(config.getBackendUrlPrefix() + "article/find-articles-by-tagid?tagid=" + req.query.id,function(error,response,body){
        	        if(!error && response.statusCode == 200){
            		    var returnData = JSON.parse(body);

            		    if(returnData.statusCode != 0){
                            logger.error("visitor/tag.js -- /article/find-articles-by-tagid/ fail ..." +
                                "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                            res.render('error/unknowerror');
            	    	} else {
                            callback(null,returnData.data);
            		    }
        	        } else {
                        logger.error("visitor/tag.js -- /article/find-articles-by-tagid/ fail ..." +
                            "error = " + error);
                    if(response != null){
                            logger.error("visitor/tag.js -- /article/find-articles-by-tagid/ fail ..." +
                                "response.statuCode = " + response.statusCode + "..." +
                                "response.body = " + response.body);
                         }
                        res.render('error/unknowerror');
        	        }
    	        });
            //请求 标签 数据
            },function(data,callback){
                request(config.getBackendUrlPrefix() + "tag/find-all-tags",function(error,response,body){
                    if(!error && response.statusCode == 200){
                        var returnData = JSON.parse(body);
                        if(returnData.statusCode != 0){
                            logger.error("visitor/index.js -- tag/find-all-tags fail ..." +
                                   "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                            res.render('error/unknowerror');
                         } else {
                            data.tags = returnData.data.tags;
                            callback(null,data);
                        }
                     } else {
                        logger.error("visitor/index.js -- tag/find-all-tags fail ..." +
                                   "error = " + error);
                        if(response != null){
                            logger.error("visitor/index.js -- tag/find-all-tags fail ..." +
                                   "response.statuCode = " + response.statusCode + "..." +
                                   "response.body = " + response.body);
                        }
                        res.render('error/unknowerror');
                     }
                });
            }
        ],function(err,result){
            res.render('visitor/v3/learning/index',{'data':result});
        })
});

module.exports = router;