/**
 * Created by deming.zhu on 2014/9/10.
 */
;
(function () {
    "use strict";

    function _fireTransitDivEvent() {
        var _evt = document.createEvent('Events');
        _evt.initEvent("receiveFromNativeEvent");
        document.dispatchEvent(_evt);
    }

    function _log(act, obj, flag) {
        if(/logUserAction/.test(act)) {
            return;
        }
        console.group(act + (flag ? "接口发送" : "接口返回"));
        console.dir(obj);
        console.groupEnd();
    }

    document.addEventListener("sendToNativeEvent", function () {
        var messAry = JSON.parse(document.getElementById("sendTransit").innerText);

        for (var i = 0, len = messAry.length; i < len; i++) {
            //_log(messAry[i].data.action, messAry[i].data, true);
            chrome.extension.sendRequest(messAry[i].data, function (response) {
                var resText = response.testdata ? response.testdata : response;
                _log(response.action, JSON.parse(resText), false);
                document.getElementById("responseTransit").innerText = resText;
                _fireTransitDivEvent();
            });
        }
    }, false);

    var script = document.createElement("script");
    script.src = chrome.extension.getURL("js/WebViewJavascriptBridge.js");
    document.body.appendChild(script);

})();