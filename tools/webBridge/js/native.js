;(function(win) {

var doc = win.document,
    
    ua = navigator.userAgent,
    
    os = ua.match(/iphone|ipad|ipod/i) ? "ios" : (ua.match(/msie/i) ? "ms" : "android"),
    
    bridge = null,
    
    queueAry = [],
    
    handlerMap = {},
    
    connected = function() {},
    
    connectIOS = function(arg) {
        doc.removeEventListener("WebViewJavascriptBridgeReady", connect, false);
        bridge = arg.bridge;
        bridge.init();
        bridge.registerHandler("amapCallWebViewHandler", win.callback);
    },
    
    connectMS = function() {
        doc.removeEventListener("DOMContentLoaded", connect, false);
		bridge = {
			send:function(param){
				param = JSON.stringify(param);
				win.external.notify(param);
			}
	    };
        bridge.send({"action":"registerCallback", "callbackname":"callback"});
    },
    
    connectAndroid = function() {
        doc.removeEventListener("DOMContentLoaded", connect, false);
        bridge = {
            send: function(param) {
                param = JSON.stringify(param);
                if (arguments[1]){
                    win.jsInterface.invokeMethod("send", [param, arguments[1]]);
                }else{
                    win.jsInterface.invokeMethod("send", [param]);
                }
            }
        };
        bridge.send({"action":"registerCallback"}, "callback");
    },
    
    connect = function(arg) {
        if("object" === typeof(arg)) {
            "ios" === os ? connectIOS(arg) : ("android" === os ? connectAndroid() : connectMS());
            connected.call(null);
            sendIterator(queueAry);
        }
    },
    
    sendIterator = function(queue) {
        if("[object Array]" === Object.prototype.toString.call(queue)) {
            while(queue.length) {
                bridge.send(queue.shift());
            }
        }
    },
    
    callback = function(data) {
        if("string" === typeof(data)) {
            data = JSON.parse(data);
        }
        var _act = data._action;
        delete data._action;
        if("[object Function]" === Object.prototype.toString.call(handlerMap[_act])) {
            handlerMap[_act](data);
        }
        if(0 !== _act.indexOf("_HOLD_")) {
            handlerMap[_act] = null;
            delete handlerMap[_act];
        }
    },
    
    init = function(key, handler) {
        key && (window.ampTpl = key);
        if(bridge) {
            handler && handler.call(null);
            return;
        }
        handler && (connected = handler);
        doc.addEventListener(
            "ios" === os ? "WebViewJavascriptBridgeReady" : "DOMContentLoaded", 
            connect, 
            false
        );
    },
    
    bridgeObj = {
        
        send : function(param, handler) {
            if("string" === typeof param) {
                param = JSON.parse(param);
            }
            if(handler) {
                if(!param._action) {
                    var _actionStr = "_ACTION_TO_NATIVEAPI_" + (Math.random().toString().replace("0.", ""));
                    if(!param.hasOwnProperty("function")) {
                        param._action = _actionStr;
                    } else {
                        _actionStr = "_HOLD" + _actionStr;
                        (param["function"])._action = _actionStr;
                    }
                    handlerMap[_actionStr] = handler;
                } else {
                    handlerMap[param._action] = handler;
                }
            }
            //alert("发送参数 = " + JSON.stringify(param));
            if(bridge) {
                bridge.send(param);
            } else {
                queueAry.push(param);
            }
        },
        
        start : function(key, handler) {
            init(key, handler);
        }
        
    };

win.callback = callback;
win.poiBridge = bridgeObj;

init();
})(window);