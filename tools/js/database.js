/**
 * Created by deming.zhu on 2014/9/10.
 */

//    dataBase.dropTable();
//    dataBase.create();
//    dataBase.insertClient({
//        action: "getMapLocation",
//        testData: '{"poiid" : "B000A7O1CU","adcode" : "110108","x" : "220917860", "y": "101625267", "lon": "116.27393782138823", "lat": "39.998769064766265"}'
//    });
//    dataBase.insertClient({
//        action: "getPoiInfo",
//        testData: '{"_action":"_getPoiInfo"}'
//    });
//    dataBase.removeClient(2);
//    dataBase.select(dataBase.SELECT_SQL_ACTION, ["getMapLocation"], function(rs) {});

;
(function () {
    "use strict";
    window.dataBase = {

        db: window.openDatabase("APP_TOOL_DB", "", "app tool database", 204800),

        CREATE_CLIENT_TABLE: "CREATE TABLE IF NOT EXISTS t_client(id INTEGER PRIMARY KEY ASC, action TEXT, testdata TEXT)",

        CREATE_AOS_TABLE: "CREATE TABLE IF NOT EXISTS t_aos(id INTEGER PRIMARY KEY ASC, url TEXT, testdata TEXT, delay INTEGER, method TEXT, online INTEGER)",

        INSERT_CLIENT: "INSERT INTO t_client VALUES(?, ?, ?)",

        INSERT_AOS: "INSERT INTO t_aos VALUES(?, ?, ?, ?, ?, ?)",

        SELECT_CLIENT_ALL: "SELECT * FROM t_client",

        SELECT_CLIENT_ACTION: "SELECT * FROM t_client WHERE action = ?",

        SELECT_AOS_ALL: "SELECT * FROM t_aos",

        SELECT_AOS_URL: "SELECT * FROM t_aos WHERE url LIKE ?",

        DELETE_CLIENT: "DELETE FROM t_client WHERE id = ?",

        DELETE_AOS: "DELETE FROM t_aos WHERE id = ?",

        _error: function (tx, error) {
            alert(error.source + "::" + error.message);
        },

        _executeSql: function (sqlStr, paramAry, succFun) {
            var _this = this;
            this.db.transaction(function (tx) {
                tx.executeSql(sqlStr, paramAry || [], succFun, _this._error);
            });
        },

        create: function () {
            var _this = this;
            this._executeSql(this.CREATE_CLIENT_TABLE, [], function (tx, rs) {
                _this._executeSql(_this.CREATE_AOS_TABLE, [], function (tx, rs) {
                    alert("表创建成功");
                });
            });
        },

        insertClient: function (itemObj) {
            this._executeSql(this.INSERT_CLIENT, [null, itemObj.action, itemObj.testData], function (tx, rs) {
                alert("插入成功");
            });
        },

        insertAOS: function (itemObj) {
            this._executeSql(this.INSERT_AOS, [null, itemObj.url, itemObj.testData, itemObj.delay, itemObj.method, itemObj.online], function (tx, rs) {
                alert("插入成功");
            });
        },

        select: function (sqlStr, paramAry, handler) {
            if(!sqlStr) {
                alert("sql语句错误！");
                return;
            }
            paramAry = paramAry || [];
            if ("[object Array]" !== Object.prototype.toString.call(paramAry)) {
                paramAry = [ paramAry ];
            }

            this._executeSql(sqlStr, paramAry, function (tx, rs) {
                handler.call(null, rs);
            });
        },

        removeClient: function (id) {
            this._executeSql(this.DELETE_CLIENT, [id], function (tx, rs) {
                alert("删除成功");
            });
        },

        removeAOS: function (id) {
            this._executeSql(this.DELETE_AOS, [id], function (tx, rs) {
                alert("删除成功");
            });
        },

        dropTable: function () {
            var _this = this;
            this._executeSql("DROP TABLE IF EXISTS t_client", [], function (tx, rs) {
                _this._executeSql("DROP TABLE IF EXISTS t_aos", [], function (tx, rs) {
                    alert("删除数据表成功");
                });
            });
        }

    };

})();
