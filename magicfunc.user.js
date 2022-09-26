// ==UserScript==
// @name        神奇海螺扩展
// @description 给网页添加特殊功能
// @namespace   https://lab.magiconch.com
// @version     0.1.1
// @license     MIT
// @author      itorr
// @include     *://lab.magiconch.com/*
// @include     *://192.168.31.7:81/*
// @run-at         document-start
// @noframes
// @grant          GM_setClipboard
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_getResourceText
// @grant          GM_info
// @grant          GM_addStyle
// @connect        *
// ==/UserScript==

/**
 *  grant          unsafeWindow
 */


 unsafeWindow.GM_xmlhttpRequest = GM_xmlhttpRequest;