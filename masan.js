/**
 * 下拉刷新插件
 */
;(function($){
    'use strict';
    var args = {
            loadClass : 'dropload-box',   
            reloadFreshDom : '<div class="dropload-refresh">↑上拉加载更多</div>',                                  // 下拉容器class
            refreshDOM : '<div class="dropload-refresh"><span><img src="jiantou1.png"></span><span>下拉刷新</span></div>',    // 下拉DOM
            updateDOM : '<div class="dropload-update"><span><img src="jiantou2.png"></span><span>释放更新</span></div>',      // 更新DOM
            loadDOM : '<div class="dropload-load"><span><img src="http://static.diditaxi.com.cn/activity/img-mall/loading_2.gif" width="22" height="22"/></span><span>加载中...</span></div>',         // 加载DOM
            direction : 'up',                                               // 加载内容方向
            distance : 50                                                   // 下拉距离
        },
        _startY = 0,
        _moveY = 0,
        _curY = 0,
        _offsetY = 0,
        _loadHeight = 0,
        _childrenHeight = 0,
        _scrollTop = 0,
        insertDOM = false,
        loading = false,
        loadName = '';
    $.fn.dropload = function(options){
        new MyDropLoad(this, options);
        return this;
    };
    var MyDropLoad = function(element, options){
        var me = this;
        me.$element = $(element);
        me.init(element, options);
    };

    // 初始化
    MyDropLoad.prototype.init = function(element, options){
        var me = this;
        me.options = $.extend({}, args, options);
        loadName = '.'+me.options.loadClass;
        // 绑定触摸
        me.$element.on('touchstart',function(e){
            if(loading){
                return;
            }
            me.fnTouches(e);
            me.fnTouchstart(e);
        });
        me.$element.on('touchmove',function(e){
            if(loading){
                return;
            }
            me.fnTouches(e);
            me.fnTouchmove(e);
        });
        me.$element.on('touchend',function(){
            if(loading){
                return;
            }
            me.fnTouchend();
        });
    };

    // touches
    MyDropLoad.prototype.fnTouches = function(e){
        if(!e.touches){
            e.touches = e.originalEvent.touches;
        }
    };

    // touchstart
    MyDropLoad.prototype.fnTouchstart = function(e){
        var me = this;
        _startY = e.touches[0].pageY;
        _loadHeight = me.$element.height();
        _childrenHeight = me.$element.children().height();
        _scrollTop = me.$element.scrollTop();
    };

    // touchmove
    MyDropLoad.prototype.fnTouchmove = function(e){
        _curY = e.touches[0].pageY;
        _moveY = _curY - _startY;
        var me = this,
            _absMoveY = Math.abs(_moveY);
        // 加载上放
        if(me.options.direction == 'up' && _scrollTop <= 0 && _moveY > 0){
            e.preventDefault();
            if(!insertDOM){
                $(".pageBody").prepend('<div class="'+me.options.loadClass+'"></div>');
                insertDOM = true;
            }
            fnTransition($(loadName),0);
            // 下拉
            if(_absMoveY <= me.options.distance){
                _offsetY = _absMoveY;
                $(loadName).html('').append(me.options.refreshDOM);
            // 指定距离 < 下拉距离 < 指定距离*2
            }else if(_absMoveY > me.options.distance && _absMoveY <= me.options.distance*2){
                _offsetY = me.options.distance+(_absMoveY-me.options.distance)*0.5;
                $(loadName).html('').append(me.options.updateDOM);
            // 下拉距离 > 指定距离*2
            }else{
                _offsetY = me.options.distance+me.options.distance*0.5+(_absMoveY-me.options.distance*2)*0.2;
            }
            $(loadName).css({'height': _offsetY});
        }
        // 加载下方
        if(me.options.direction == 'down'&& _childrenHeight <= (_loadHeight+_scrollTop) && _moveY < 0){
            e.preventDefault();

            if(!insertDOM){
                $(".pageBody").append('<div class="'+me.options.loadClass+'"></div>');
                insertDOM = true;
            }
            fnTransition($(loadName),0);
            // 下拉
            if(_absMoveY <= me.options.distance){
                _offsetY = _absMoveY;
                $(loadName).html('').append(me.options.reloadFreshDom);
            // 指定距离 < 下拉距离 < 指定距离*2
            }else if(_absMoveY > me.options.distance && _absMoveY <= me.options.distance*2){
                _offsetY = me.options.distance+(_absMoveY-me.options.distance)*0.5;
                $(loadName).html('').append(me.options.updateDOM);
            // 下拉距离 > 指定距离*2
            }else{
                _offsetY = me.options.distance+me.options.distance*0.5+(_absMoveY-me.options.distance*2)*0.2;
            }
            $(loadName).css({'height': _offsetY});
            me.$element.scrollTop(_offsetY+_scrollTop);
            //me.$element.animate({ scrollTop :_offsetY+_scrollTop}, { duration: '800' });
        }
    };

    // touchend
    MyDropLoad.prototype.fnTouchend = function(){
        var me = this,
            _absMoveY = Math.abs(_moveY);
        if(insertDOM){
            fnTransition($(loadName),300);
            if(_absMoveY > me.options.distance){
                $(loadName).css({'height':$(loadName).children().height()});
                $(loadName).html('').append(me.options.loadDOM);
                me.fnCallback();
            }else{
            	loading = false;
                insertDOM = false;
                $(loadName).css({'height':'0'}).on('webkitTransitionEnd',function(){
                    $(this).remove();
                });
                setTimeout(function(){
                	loading = false;
	        		insertDOM = false;
        			$(loadName).remove();
                },500); 
            }
            _moveY = 0;
        }
    };

    // 回调
    MyDropLoad.prototype.fnCallback = function(){
        var me = this;
        loading = true;
        me.$element.trigger('dropload',me);
    };

    // 重置
    MyDropLoad.prototype.resetload = function(){
        var me = this;
        if($(loadName).length){
        	loading = false;
            insertDOM = false;
            $(loadName).css({'height':'0'}).on('webkitTransitionEnd',function(){
                $(this).remove();
            });
            setTimeout(function(){
            	loading = false;
        		insertDOM = false;
        		$(loadName).remove();
        	},500);
        }
    };

    // css过渡
    function fnTransition(dom,num){
        dom.css({
            '-webkit-transition':'all '+num+'ms',
            'transition':'all '+num+'ms'
        });
    }
})(window.Zepto);



addEventListener("DOMContentLoaded",function(){
	var login = dd.login || {};

	/*
	@@获取url中的参数
	*/
	function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return r[2];
        return "";
    }

	var doc=document,
		base = dd.base || {},
		div_pageBody = doc.querySelector(".pageBody"),
		div_listmsgs = doc.querySelector(".listmsgs"),
		div_loadmore = doc.querySelector(".loadmore"),
		div_errorMsg = '<div class="errmsg"><ul><li><img src="icon.png"></li><li>网络繁忙，获取消息失败</li></ul></div>',
		div_noMsg = '<div class="errmsg"><ul><li><img src="icon.png"></li><li>暂无消息</li></ul></div>'
		div_nomsg = doc.querySelector(".nomsg"),
		div_tips = doc.querySelector(".tips"),
		countIndex = 0,
		pageSize = 10,
		hasNewMsgUrl = "/queryHasNewMsg/?token="+getQueryString("token")+"&phone="+getQueryString("phone")+"&city_id="+((getQueryString("city_id")==""||getQueryString("city_id")=="(null)")?"10000":getQueryString("city_id")),
		fetchMsgUrl = "/fetchMsgs/?token="+getQueryString("token")+"&phone="+getQueryString("phone")+"&city_id="+((getQueryString("city_id")==""||getQueryString("city_id")=="(null)")?"10000":getQueryString("city_id"))+"&begin=",
		loadTips = {
			default:"点击加载更多消息",
			loading:"消息加载中...",
			loaded:"没有更多消息了"
		};

	/*
	@@初始化DidiJSBridge
	*/ 
    var connectDidiJSBridge = function(callback) {
        if (window.DidiJSBridge) {
            callback(DidiJSBridge);
        } else {
            document.addEventListener('DidiJSBridgeReady', function() {
                callback(DidiJSBridge);
            }, false);
        }
    };


	/*
	@@通知native取消红点
	*/
	function cancelPoint(){
		// 执行连接DidiJSBridge
	    connectDidiJSBridge(function(bridge) {
	        if (typeof bridge === 'undefined') return;
            var json = {
                page_name: '',
                orderid: 'message-center'
            }
            bridge.callHandler('page_messagelist_readed', JSON.stringify(json));
	    });
	}
	cancelPoint();

	/*
	@@格式化时间戳
	@@time 时间戳
	@@isShowSec 是否显示秒  default:false
	@@formate 日期分隔符 default:-
	*/
	function formatDate(time,isShowSec,formate){
		var d=new Date(parseInt(time)),
			formate=formate||'-',
			isShowSec=isShowSec||false;
		return d.getFullYear()+formate+(d.getMonth()+1)+formate+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+(isShowSec?(":"+d.getSeconds()):"");
	}

	/*
	@@渲染消息队列
	@@data:消息数组 array 
	@@direction:是下拉刷新还是上拉加载，这个决定数据是append还是替换之前的数据  down||up
	*/
	function listItem(data,direction,isfirst){
		if(!data) return;
		//如果首次加载
		if(direction==="down"&&data.length==0){
			return;
		}
		//上拉加载若无新数据
		if(direction==="up"&&data.length==0){
			$(div_loadmore).text(loadTips.loaded);
			return;
		}

		
		var msgHtml=[];
		for(var i=0;i<data.length;i++){
			var msg=data[i];
			msgHtml.push('<div class="msg-item" data-url="'+base.txtToJson(msg.link.content).url+'" data-link-type="'+msg.link.type+'">');
			msgHtml.push('<div class="msg-title">'+msg.title+'</div>')
			msgHtml.push('<div class="msg-date">'+msg.time.display+'</div>');
			if(msg.imageurl){
				msgHtml.push('<div class="msg-img"><img src="'+msg.imageurl+'" onerror="javascript:this.src=\'morentupian.png\';this.width=\'50\';this.parentNode.className=\'msg-img error-img\'"/></div>');
			}
			msgHtml.push('<div class="msg-content">'+msg.content+'</div>');
			var likUrl = base.txtToJson(msg.link.content);
			if(likUrl.url){
				msgHtml.push('<div class="msg-detail-link">');
				msgHtml.push('<ul>');
				msgHtml.push('<li class="detail">查看详情</li>');
				msgHtml.push('<li class="arrow"><img src="jiantou.png" style="width:9px;"/></li>');
				msgHtml.push('</ul>');
				msgHtml.push('</div>');
			}
			msgHtml.push('</div>');
		}
		if(direction==="down"){
			$(div_listmsgs).html(msgHtml.join(''));
		}else{
			$(div_listmsgs).append(msgHtml.join(''));
		}
		$(div_loadmore).text(loadTips.default).css({"color":"#ff8903"}).removeClass('hidden');
	}

	/*
	@@发送请求，获取消息数据
	@@direction 方向
	*/
	function getMsgData(options){
		options=options||{};
		direction=options.direction||"down",
		isfirst=options.isfirst||false;
		if(direction==="down")countIndex=0;
		else countIndex==0?countIndex+=9:countIndex+=10;
		base.ajax({
			url:fetchMsgUrl+countIndex+"&count="+pageSize,
			method:"GET",
			succFunc:function(d){
				var data=base.txtToJson(d);
				if(data.errno==0){
					listItem(data.msgs,direction,isfirst);
					if(data.msgs.length>0&&isfirst){
						options.callback&&options.callback();
					}
					//首次加载如果请求数据若为空，则返回没有数据的页面
				    if(isfirst&&data.msgs.length==0) $(div_pageBody).html(div_noMsg);
				    //加载时返回的数据记录数少于一页的记录数，默认10条，则隐藏加载更多
				    if(data.msgs.length<10) $(div_loadmore).hide();
				}else if(data.errno==2){
					login.validLoginStatus({
                        loginStatus:false
                    });
                    return;
				}else if(data.errno!=0&&isfirst){
					//第一次加载时，后台出现问题
					var errMsg = '<div class="errmsg"><ul><li><img src="icon_shibai.png"></li><li>消息加载失败，请返回重试</li></ul></div>';
					$(div_pageBody).html(errMsg);
				}
			},
			failFunc:function(){
				//网络繁忙，加载失败
				//如果页面上已经有了数据，则浮层提示网络繁忙
				//如果页面上不存在数据，则整个页面显示网络错误
				if($(div_pageBody).find(".msg-item").length>0){
					options.callback&&options.callback();
					//$(div_tips).text("网络繁忙，请稍后再试").removeClass('hidden');
					$(div_loadmore).text(loadTips.default).css({"color":"#ff8903"}).removeClass('hidden');
					// setTimeout(function(){
					// 	$(div_tips).text("暂无最新消息").addClass('hidden');
					// },2000);
				}
				else $(div_pageBody).html(div_errorMsg);
			}
		});
	}
	getMsgData({"isfirst":true,callback:loadRefresh});


	/*
	@@验证是否有新消息
	*/
	function hasNewMsg(callback){
		base.ajax({
			url:hasNewMsgUrl,
			method:"GET",
			succFunc:function(d){
				var data=base.txtToJson(d);
				if(data.errno==0){
					if(data.newmsg==0){
						// $(div_tips).text("暂无最新消息").removeClass('hidden');
						// setTimeout(function(){
						// 	$(div_tips).addClass('hidden');
						// },1500);
					}else{
						callback&&callback();
					}
				}else if(data.errno==2){
					login.validLoginStatus({
                        loginStatus:false
                    });
				}
			},
			failFunc:function(){
			}
		});
	}


	/*
	@@url跳转事件
	@@description:link.type==0什么也不做,link.type==1直接location.href跳转，如果为2则通知native跳转
	*/
	base.touch(div_pageBody,function(){
			var target = (event.target)?event.target:event.srcElement;
			if($(target).parents(".msg-item")||target.className=="msg-item"){
			var url=target.className=="msg-item"?target.getAttribute("data-url"):$(target).parents(".msg-item").attr("data-url"),
				url_type=target.className=="msg-item"?target.getAttribute("data-link-type"):$(target).parents(".msg-item").attr("data-link-type");

			if(url_type=="0"){    
				//location.href=url;
				//什么也不做，预留之后的跳转类型
			}else if(url_type=="1"&&url){
				dd.dialog.loading();
				//消息中心的链接只支持短链接，所以这些参数挂不了
				if(url.indexOf("?")!=-1){
				 	url=url+"&token="+getQueryString("token")+"&lat="+getQueryString("lat")+"&lng="+getQueryString("lng");
				}else{
				 	url=url+"?token="+getQueryString("token")+"&lat="+getQueryString("lat")+"&lng="+getQueryString("lng");
			        }
				location.href=url;
			}else if(url_type=="2"&&url){
			    // 执行连接DidiJSBridge
			    connectDidiJSBridge(function(bridge) {
			        if (typeof bridge === 'undefined') return;
	                var json = {
	                    page_name: url,
	                    orderid: 'message-center'
	                }
	                bridge.callHandler('native_redirect', JSON.stringify(json));
			    });
			}
		}
	});
	
	/*
	@@下拉刷新
	*/
	function loadRefresh(){
		$('.msg-item').eq(0).dropload({"direction":"up"}).on('dropload',function(e,me){
			hasNewMsg(function(){
				getMsgData();
			});
			setTimeout(function(){
				me.resetload();
			},2000);
		});
	}

	/*
	@@点击加载更多
	*/
	base.touch(div_loadmore,function(){
		if($(div_loadmore).text()===loadTips.loaded) return;
		$(div_loadmore).text(loadTips.loading).css({"color":"#999"});
		getMsgData({"direction":"up"});
	});

},false);
