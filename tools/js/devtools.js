/**
 * Created by zhudeming on 14/9/16.
 */
;(function() {

    chrome.devtools.panels.create("工具", "FontPicker.png", "panel.html", function(panel) {});

    alert(chrome.extension.getBackgroundPage);

//    var bg = chrome.extension.getBackgroundPage();
//
//    bg.test();
//    chrome.extension.sendRequest("aaaaa");

})();