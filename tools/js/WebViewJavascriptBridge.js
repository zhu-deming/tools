/**
 * Created by deming.zhu on 2014/9/10.
 */
;
(function () {
    "use strict";
    if (window.WebViewJavascriptBridge) {
        return
    }
    var sendTransitDiv, responseTransitDiv;
//    var messagingIframe;
    var sendMessageQueue = [];
    var receiveMessageQueue = [];
    var messageHandlers = {};
    var SEND_TO_NATIVE_EVENT = "sendToNativeEvent";
    var RECEIVE_FROM_NATIVE_EVENT = "receiveFromNativeEvent";
    var _hanlerName = "";
//    var CUSTOM_PROTOCOL_SCHEME = 'wvjbscheme';
//    var QUEUE_HAS_MESSAGE = '__WVJB_QUEUE_MESSAGE__';
    var responseCallbacks = {};
    var uniqueId = 1;

    function _fireTransitDivEvent() {
        var _evt = document.createEvent('Events');
        _evt.initEvent(SEND_TO_NATIVE_EVENT);
        document.dispatchEvent(_evt);
    }

    function _receiveHandler(evt) {
        var _data = {
            data: JSON.parse(document.getElementById("responseTransit").innerText)
        };
        _handleMessageFromObjC(JSON.stringify(_data));
    }

    function _createTransitDiv() {
        var _fragment = document.createDocumentFragment();
        var _div = document.createElement("div");
        _div.style.cssText = "display:none";

        sendTransitDiv = _div.cloneNode(true);
        sendTransitDiv.setAttribute("id", "sendTransit");
        responseTransitDiv = _div.cloneNode(true);
        responseTransitDiv.setAttribute("id", "responseTransit");

        _fragment.appendChild(sendTransitDiv);
        _fragment.appendChild(responseTransitDiv);

        document.body.appendChild(_fragment);

        document.addEventListener(RECEIVE_FROM_NATIVE_EVENT, _receiveHandler, false);

        _div = null;

    }

//    function _createQueueReadyIframe(doc) {
//        messagingIframe = doc.createElement('iframe');
//        messagingIframe.style.display = 'none';
//        messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
//        doc.documentElement.appendChild(messagingIframe)
//    }

    function init(messageHandler) {
        if (WebViewJavascriptBridge._messageHandler) {
            throw new Error('WebViewJavascriptBridge.init called twice')
        }
        WebViewJavascriptBridge._messageHandler = messageHandler;
        var receivedMessages = receiveMessageQueue;
        receiveMessageQueue = null;
        for (var i = 0; i < receivedMessages.length; i++) {
            _dispatchMessageFromObjC(receivedMessages[i])
        }
    }

    function send(data, responseCallback) {
        _doSend({ data: data }, responseCallback)
    }

    function registerHandler(handlerName, handler) {
        _hanlerName = handlerName;
        messageHandlers[handlerName] = handler
    }

    function callHandler(handlerName, data, responseCallback) {
        _doSend({ handlerName: handlerName, data: data }, responseCallback)
    }

    function _doSend(message, responseCallback) {
        if (responseCallback) {
            var callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime();
            responseCallbacks[callbackId] = responseCallback;
            message['callbackId'] = callbackId
        }
        sendMessageQueue.push(message);
        _fetchQueue();
        _fireTransitDivEvent();
//        messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
    }

    function _fetchQueue() {
        var messageQueueString = JSON.stringify(sendMessageQueue);
        sendMessageQueue = [];
        sendTransitDiv.innerText = messageQueueString;
        //return messageQueueString
    }

    function _dispatchMessageFromObjC(messageJSON) {
        setTimeout(function _timeoutDispatchMessageFromObjC() {
            var message = JSON.parse(messageJSON);
            var messageHandler;
            if (message.responseId) {
                var responseCallback = responseCallbacks[message.responseId];
                if (!responseCallback) {
                    return;
                }
                responseCallback(message.responseData);
                delete responseCallbacks[message.responseId]
            } else {
                var responseCallback;
                if (message.callbackId) {
                    var callbackResponseId = message.callbackId;
                    responseCallback = function (responseData) {
                        _doSend({ responseId: callbackResponseId, responseData: responseData })
                    }
                }
                var handler = WebViewJavascriptBridge._messageHandler;
                if (_hanlerName) {
                    handler = messageHandlers[_hanlerName]
                }
                try {
                    if (!responseCallback){
                        responseCallback = function () {};
                    }
                    handler(message.data, responseCallback)
                } catch (exception) {
                    if (typeof console != 'undefined') {
                        console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception)
                    }
                }
            }
        })
    }

    function _handleMessageFromObjC(messageJSON) {
        if (receiveMessageQueue) {
            receiveMessageQueue.push(messageJSON)
        } else {
            _dispatchMessageFromObjC(messageJSON)
        }
    }

    window.WebViewJavascriptBridge = {
        init: init,
        send: send,
        registerHandler: registerHandler,
        callHandler: callHandler,
        _fetchQueue: _fetchQueue,
        _handleMessageFromObjC: _handleMessageFromObjC
    };
    var doc = document;
    _createTransitDiv();
    //_createQueueReadyIframe(doc);
    var readyEvent = doc.createEvent('Events');
    readyEvent.initEvent('WebViewJavascriptBridgeReady');
    readyEvent.bridge = WebViewJavascriptBridge;
    doc.dispatchEvent(readyEvent)
})();

;(function() {
    setTimeout(function() {
        WebViewJavascriptBridge.send({action:"getPoiInfo",_action:"setPoiInfo"});
    }, 30);
})();