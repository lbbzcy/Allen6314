var express = require('express');
var router = express.Router();

var md = require('node-markdown').Markdown;
var request = require('request');
var async = require('async');

var Config = require('../../../config/globalconfig.js');
var config = new Config();

var MyCookies = require('../../../common_utils/mycookies.js');
var mycookies = new MyCookies();

var Logger = require('../../../config/logconfig.js');
var logger = new Logger().getLogger();



//添加文章 -- 跳到添加文章首页
router.get('/addArticle',function(req,res,next){

    var urlTags = config.getBackendUrlPrefix() + "auth/tag/find-all-tags";
	var optionsTags = {
        url:urlTags,
        headers:{
            'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
        }
    }
    async.waterfall([
        function(callback){
            request(optionsTags,function(error,response,body){
                var returnData = JSON.parse(body);
                if(returnData.statusCode == 0){
                    callback(null,returnData.data);
                } else {
                    logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                }
            });
        }
    ],function(err,result){
        if(!err){
            res.render('admin/v4/article/add_updateArticle',{'data':result});
        } else {
            logger.error(err);
            res.render('error/unknowerror');
        }
    })
});




//添加文章
router.post('/addArticle/doAdd',function(req,res,next){
    var url = config.getBackendUrlPrefix() + "auth/article/save-article";
	var data = {
            'id': req.body.id,
        	'title': req.body.title,
         	'content': req.body.mdData,
         	'tagId': req.body.tagId,
    	}
    var options = {
    	url:url,
    	headers:{
            'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
		},
	    form:data
    }
    request.post(options,function(error,response,body){
        if(!error && response.statusCode == 200 ){
            var returnData = JSON.parse(body);
            if(returnData.statusCode == 0){
                res.redirect('/admin/article/articleManage');
            } else {
			    logger.log("unknow error in kong or java,because response.statusCode = 200, returnData.statusCode != 0 ");
            }
        } else {
            logger.error("admin/article.js -- auth/article/save-article ..." +
                "error = " + error);
            if(response != null){
                logger.error("admin/article.js -- auth/article/save-article fail ..." +
                    "response.statuCode = " + response.statusCode + "..." +
                    "response.body = " + response.body);
            }
        	if(response.statusCode == 401){
			    res.render('admin/v4/login');
		    } else {
                res.render('error/unknowerror');
			}
		}
   	});
});



//删除文章
router.get('/deleteArticle',function(req,res,next){
    var url = config.getBackendUrlPrefix() + "auth/article/delete-article-by-id";
    var data = {id:req.query.id};
    var options = {
        url:url,
            headers:{
                'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
            },
        form:data
    }
    request.post(options,function(error,response,body){
        if(!error && response.statusCode == 200 ){
            var returnData = JSON.parse(body);
            if(returnData.statusCode == 0){
                res.redirect('/admin/article/articleManage');
            } else {
                logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                        "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                res.render('error/unknowerror');
            }
        } else {
            logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                "error = " + error);
            if(response != null){
                logger.error("admin/article.js -- auth/admin/deleteArticle fail ..." +
                    "response.statuCode = " + response.statusCode + "..." +
                    "response.body = " + response.body);
            }
            res.render('error/unknowerror');
        }
    });
});




//修改文章 -- 跳到修改文章页面
router.get('/modifyArticle',function(req,res,next){
    var urlTags = config.getBackendUrlPrefix() + "auth/tag/find-all-tags";
	var optionsTags = {
        url:urlTags,
        headers:{
            'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
        }
    }
	var urlFindArticle = config.getBackendUrlPrefix() + "auth/article/find-article-by-id?id=" + req.query.id;
	var optionFindArticle = {
        url:urlFindArticle,
        headers:{
            'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
        }
    }
    async.waterfall([
        //请求tags
       function(callback){
            request(optionsTags,function(error,response,body){
                var returnData = JSON.parse(body);
                if(returnData.statusCode == 0){
                    callback(null,returnData.data);
                } else {
                    logger.error("admin/article.js -- auth/tag/find-all-tags fail ..." +
                        "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                }
            });
        },function(data,callback){
            request(optionFindArticle,function(error,response,body){
                var returnData = JSON.parse(body);
                if(returnData.statusCode == 0){
                    data.article = returnData.data.article;
                    callback(null,data);
                } else {
                    logger.error("admin/article.js -- auth/article/find-article-by-id?id=xx fail ..." +
                        "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                }
            });
        }],
    function(err,result){
        if(!err){
            res.render('admin/v4/article/add_updateArticle',{'data':result});
        } else {
            logger.error(err.stack);
            res.render('error/unknowerror');
        }
    })
});




//文章管理首页
router.get('/articleManage',function(req,res,next){

    var moduleid;
    async.waterfall([
        function(callback){
            var url = config.getBackendUrlPrefix() + "auth/module/find-all-modules";
            var options = {
                url:url,
    	        headers:{
                    'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
	            },
            }
            request(options,function(error,response,body){
                var returnData = JSON.parse(body);
                if(returnData.statusCode != 0){
                    logger.error("admin/artice.js -- module/find-all-modules fail ..." +
                        "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                } else {
                    callback(null,returnData.data);
                }
            });
        },
        function(data,callback){
            var modules = data.modules;
            modules.forEach(function(entry){
                if(entry.name == "Learning"){
                    moduleid = entry.id;
                }
            })

            var pageSize = config.getArticleListPageSize();
            var url = config.getBackendUrlPrefix() + "auth/article/find-articles-by-moduleid?moduleid=" +
                            moduleid + "&page=1&size=" + pageSize;
            var options = {
    	        url:url,
                headers:{
                    'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
                },
            }
            request(options,function(error,response,body){
                var returnData = JSON.parse(body);
                if(returnData.statusCode != 0){
                    logger.error("admin/article.js -- auth/article/find-articles-by-moduleid?moduleid fail ..." +
                       "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                } else {
                    data.articles = returnData.data.articles;
                    data.totalPage = new Array();
                    for(var i = 1; i <= returnData.data.totalPage;i++){
                        data.totalPage[i-1] = i;
                    }
                    callback(null,data);
                }
            });
        }
    ],function(err,result){
        if(!err){
            result.nowPageLeft = 0;
            result.nowPage = 1;
            result.nowPageRight = 2;
            result.moduleid =  moduleid;
            res.render('admin/v4/article/articleManageIndex',{'data':result});
        } else {
            logger.error(err);
            res.render('error/unknowerror');
        }
    });
});




router.get('/page',function(req,res,next){
    var pageNum = req.query.pagenum;
    var moduleid = req.query.moduleid;
    var tagid = req.query.tagid;
    async.parallel({
        modules: function(callback){
            var url = config.getBackendUrlPrefix() + "auth/module/find-all-modules";
            var options = {
    	        url:url,
    	        headers:{
                    'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
		        },
            }
            request(options,function(error,response,body){
                var returnData = JSON.parse(body);

                if(returnData.statusCode != 0){
                    logger.error("admin/article.js -- module/find-all-modules fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                } else {
                    callback(null, returnData.data.modules);
                }
            });
        },
        articles_totalPage: function(callback){
            var url;
            var pageSize = config.getArticleListPageSize();
            if(tagid != ""){
                url = config.getBackendUrlPrefix() + "auth/article/find-articles-by-tagid?tagId=" +
                        tagid + "&page="+ pageNum +"&size=" + pageSize;
            } else {
                url = config.getBackendUrlPrefix() + "auth/article/find-articles-by-moduleid?moduleid=" +
                        moduleid + "&page=" + pageNum + "&size=" + pageSize;
            }
            var options = {
    	        url:url,
    	        headers:{
                    'Authorization': "Bearer " + mycookies.getAdminAuthorizationCookie(req)
		        },
            }
            request(options,function(error,response,body){
                var returnData = JSON.parse(body);

                if(returnData.statusCode != 0){
                    logger.error("admin/article.js -- auth/article/find-articles-by-moduleid?moduleid fail ..." +
                            "response.statusCode = 200, but returnData.statusCode = " + returnData.statusCode);
                    res.render('error/unknowerror');
                } else {
                    callback(null,returnData.data);
                }
            });
        }

    },function(err,result){
        if(!err){
            result.articles = result.articles_totalPage.articles;
            result.totalPage = new Array();

            for(var i = 1; i <= result.articles_totalPage.totalPage;i++){
                result.totalPage[i-1] = i;
            }

            result.nowPageLeft = parseInt(pageNum) - 1;
            result.nowPage = pageNum;
            result.nowPageRight = parseInt(pageNum) + 1;
            result.moduleid = moduleid;

            res.render('admin/v4/article/articleManageIndex',{'data':result});
        } else {
            logger.error(err);
            res.render('error/unknowerror');
        }
    })
});



module.exports = router;
