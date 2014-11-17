var ws = {

    socket: null,

    transEle : document.getElementById("transEle"),
    
    messageCallback: {
    },
    
    connectObj: {
    },
    
    createName: function() {
        return "METHOD_" + Math.random().toString().replace("0.", "");
    },
    
    _onopen: function () {
        alert("opened");
    },

    _onclose: function () {
        ws.socket = null;
        alert("closed");
    },

    _onmessage: function (evt) {
        var data = evt.data;
        ws.transEle.innerHTML = data;
        data = JSON.parse(ws.transEle.innerHTML);
        if("mobile" === data._client) {
            if(data.part) {
                if(!ws.connectObj[data._key]) {
                    ws.connectObj[data._key] = [];
                }
                ws.connectObj[data._key].push(data);
                if(9999999 == data.part) {
                    ws.connectObj[data._key].sort(function(a1, a2) {return a1.part - a2.part});
                    var _data = "";
                    for(var i = 0, len = ws.connectObj[data._key].length; i< len; i++) {
                        _data = _data + ws.connectObj[data._key][i].data;
                    }
                    var _key = data._key;
                    try {
                        ws.messageCallback[_key].call(null, JSON.parse(_data));
                    } catch(e) {
                        alert("error ws.messageCallback[_key].call(null, _data) = " + e.message);
                    } finally {
                        delete ws.messageCallback[_key];
                        ws.connectObj[data._key].length = 0;
                    }
                }
            } else {
                var _key = data._key;
                var _data = "string" === typeof data.data ? JSON.parse(data.data) : data.data;
                ws.messageCallback[_key].call(null, _data);
                delete ws.messageCallback[_key];
            }
        }
    },

    createSocketMethod: function () {
        this.socket.onopen = this._onopen;
        this.socket.onclose = this._onclose;
        this.socket.onmessage = this._onmessage;
    },

    sendMessage: function (message, handler) {
        var _key = this.createName();
        message._key = _key;
        message._client = "chrome";
        message = "string" === typeof message ? message : JSON.stringify(message);
        this.messageCallback[ _key ] = handler;
        this.socket.send(message);
    },

    connect: function (hostname, port) {
        if (this.socket) {
            alert("socket已连接！");
        }
        if ("WebSocket" in window) {
            var host = "ws://" + hostname + ":" + port + "/websocket/chat";
            this.socket = new WebSocket(host);
        } else {
            alert("不支持WebSocket");
            return;
        }
        this.createSocketMethod();
    }

};