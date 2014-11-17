/**
 * 朱德明
 * Created by deming.zhu on 2014/9/11.
 */

;
(function () {
    "use strict";
//
//    function req(url, callback) {
//        var xhr = new XMLHttpRequest();
//        xhr.onreadystatechange = function () {
//            if (4 == xhr.readyState) {
//                if (200 == xhr.status) {
//                    callback.call(null, xhr.responseText);
//                } else {
//                    callback.call(null);
//                }
//            }
//        };
//        xhr.open("GET", url, true);
//        xhr.send();
//    }

    function clone(obj) {
        var retObj = new Object();
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                retObj[p] = obj[p];
            }
        }
        return retObj;
    }

    function listenerHandler(request, sender, callback) {
        var action = request.action,
            _action = request._action;

        if ("aosrequest" === request.action || "getHttpString" === request.action) {

            var _url = request.urlPrefix || request.url;

            var reqCB = function (data) {
                var obj = {
                    _action: _action,
                    content: data.content
                };
                callback.call(null, JSON.stringify(obj));
            };

            dataBase.select(dataBase.SELECT_AOS_URL, [ (_url.split("?"))[0] + "%" ], function (rs) {
                if (rs.rows.length) {
                    var isOnline = +(rs.rows.item(0).online);
                    if (!isOnline) {
                        var row = rs.rows.item(0),
                            dataObj = JSON.parse(row.testdata),
                            obj = {
                                _action: _action,
                                content: dataObj.content ? dataObj.content : row.testdata
                            };
                        setTimeout(function () {
                            callback.call(null, JSON.stringify(obj));
                        }, +row.delay || 0);
                    } else {
                        ws.socket ? ws.sendMessage(request, reqCB) : alert(_url + "没有测试数据！");
                    }
                } else {
                    ws.socket ? ws.sendMessage(request, reqCB) : alert(_url + "没有测试数据！");
                }
            });

        } else {
            
            var savedPoiid = localStorage.getItem("WEB_DEBUG_TOOL_POIID");
            if("getPoiInfo" === action && savedPoiid) {
                var infoObj = {
                    "_action": "setPoiInfo",
                    "source": "default",
                    "poiInfo": {
                        "poiid": savedPoiid,
                        "name": "开发插件测试标题",
                        "lon": 116.3211460411548,
                        "lat": 39.89605209680794,
                        "x": 220953061,
                        "y": 101725173,
                        "address": "开发插件测试地址",
                        "phoneNumbers": "010-51824233",
                        "cityCode": "110000",
                        "poiType": 1,
                        "new_type": "150200"
                    }
                };
                callback.call(null, JSON.stringify(infoObj));
            } else {
                var _cb = function _cb(rs) {
                    if (rs.rows.length) {

                        var rowObj = rs.rows.item(0);
                        var rowObjClone = clone(rowObj);
                        rowObjClone.action = action;
                        var _td = JSON.parse(rowObjClone.testdata);
                        _td._action = _action;
                        rowObjClone.testdata = JSON.stringify(_td);
                        callback.call(null, rowObjClone);

                    } else {
                        if(ws.socket) {
                            ws.sendMessage(request, function(_data) {
                                _data._action =  _action;
                                callback.call(null, JSON.stringify(_data));
                            });
                        } else {
                            alert(action + "没有测试数据！");
                        }
                    }
                };
                dataBase.select(dataBase.SELECT_CLIENT_ACTION, [ action ], _cb);
            }

        }

    }

    chrome.extension.onRequest.addListener(listenerHandler);

    dataBase.create();

})();

// ---------------------------------------------------------------------
function test() {
    alert("background");
}