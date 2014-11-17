/**
 * Created by deming.zhu on 2014/9/10.
 */
;
(function () {
    "use strict";

    var popup = {

        saveCommon: function () {
            var actionEle = document.getElementById("commonAction"),
                dataEle = document.getElementById("commonData");
            var param = {
                action: actionEle.value,
                testData: dataEle.value
            };
            dataBase.insertClient(param);
            actionEle.value = dataEle.value = "";
            this.listCommonSaved();
        },

        saveAos: function () {
            var urlEle = document.getElementById("aosUrl"),
                dataEle = document.getElementById("aosData");
            var param = {
                url: urlEle.value,
                testData: dataEle.value,
                delay: 50,
                method: "POST",
                online: 0
            };
            dataBase.insertAOS(param);
            urlEle.value = dataEle.value = "";
            this.listAosSaved();
        },

        remove: function (pid, flag) {
            if (window.confirm("确认删除？")) {
                if("common" === flag) {
                    dataBase.removeClient(pid);
                    this.listCommonSaved();
                } else {
                    dataBase.removeAOS(pid);
                    this.listAosSaved();
                }
            }
        },

        listCommonSaved: function (rs) {
            if (rs) {
                var commonSavedTable = document.getElementById("commonSavedTable");
                commonSavedTable.innerHTML = "";
                var fragment = document.createDocumentFragment();
                var _tr = null, _item = null;
                for (var i = 0, len = rs.rows.length; i < len; i++) {
                    _item = rs.rows.item(i);
                    _tr = document.createElement("tr");
                    _tr.innerHTML = '' +
                        '<td class="action_td">' + _item.action + '</td>' +
                        '<td><textarea rows="1" style="width: 100%" readonly>' + _item.testdata + '</textarea></td>' +
                        '<td class="click_td"><a click-id="deleteCommon" item-id="' + _item.id + '" href="javascript:void(0);">删除</a></td>';
                    fragment.appendChild(_tr);
                }
                commonSavedTable.appendChild(fragment);
            } else {
                dataBase.select(dataBase.SELECT_CLIENT_ALL, [], this.listCommonSaved);
            }
        },

        listAosSaved: function(rs) {
            if(rs) {
                var aosSavedTable = document.getElementById("aosSavedTable");
                aosSavedTable.innerHTML = "";
                var fragment = document.createDocumentFragment();
                var _tr = null, _item = null;
                for (var i = 0, len = rs.rows.length; i < len; i++) {
                    _item = rs.rows.item(i);
                    _tr = document.createElement("tr");
                    _tr.innerHTML = '' +
                        '<td class="action_td"><textarea rows="1" style="width: 100%" readonly>' + _item.url + '</textarea></td>' +
                        '<td><textarea rows="1" style="width: 100%" readonly>' + _item.testdata + '</textarea></td>' +
                        '<td class="click_td"><a click-id="deleteAos" item-id="' + _item.id + '" href="javascript:void(0);">删除</a></td>';
                    fragment.appendChild(_tr);
                }
                aosSavedTable.appendChild(fragment);
            } else {
                dataBase.select(dataBase.SELECT_AOS_ALL, [], this.listAosSaved);
            }
        },

        handleEvent: function (evt) {
            var tar = evt.target,
                tarId = tar.getAttribute("id") || tar.getAttribute("click-id");
            switch (tarId) {
                case "saveCommon":
                    this.saveCommon();
                    break;
                case "deleteCommon":
                    this.remove(tar.getAttribute("item-id"), "common");
                    break;
                case "saveAos":
                    this.saveAos();
                    break;
                case "deleteAos":
                    this.remove(tar.getAttribute("item-id"), "aos");
                    break;
                case "savePoiid":
                    var poiid = document.getElementById("poiid").value;
                    localStorage.setItem("WEB_DEBUG_TOOL_POIID", poiid);
                    break;
                case "clearPoiid":
                    localStorage.setItem("WEB_DEBUG_TOOL_POIID", "");
                    document.getElementById("poiid").value = "";
                    break;
                case "socket":
                    var bgjs = chrome.extension.getBackgroundPage();
                    var ip = document.getElementById("ip").value,
                        port = document.getElementById("port").value;
                    bgjs.ws.connect(ip, port);
                    break;
                default :
                    break;
            }
        },

        init: function () {
            document.getElementById("body").addEventListener("click", this, false);
            document.getElementById("poiid").value = localStorage.getItem("WEB_DEBUG_TOOL_POIID") || "";
            this.listCommonSaved();
            this.listAosSaved();
        }
    };

    popup.init();

    //dataBase.insertAOS({
    //    url: 'http://ass.test.myamap.com/ws/mapapi/recommend/tutorial/',
    //    testData: '{"code":"1","result":"success"}',
    //    delay: 50,
    //    method: "POST",
    //    online: 0
    //});

    //dataBase.select(dataBase.SELECT_AOS_ALL, [], function(rs) {
    //    if(rs.rows.length) {
    //        alert(rs.rows.item(0).url);
    //    } else {
    //        alert("dsggfdgfdhfghgfjh");
    //    }
    //});

})();