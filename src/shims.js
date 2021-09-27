/*
 * This module provides uniform
 * Shims APIs and globals that are not present in all JS environments,
 * the most common example for Strophe being browser APIs like WebSocket
 * and DOM that don't exist under nodejs.
 *
 * Usually these will be supplied in nodejs by conditionally requiring a
 * NPM module that provides a compatible implementation.
 */

let sCount=0,rCount=0;
/* Uni App 
*/
class uniWebSocket{
    constructor(service,protocol){
        console.log('__app private',service,protocol)
      const socket =  uni.connectSocket({
            url: service,
            header: {'content-type': 'application/json'},
            protocols: protocol,//['xmpp'],
            method: 'GET',
            complete: (data)=> {
                //console.log("__app Connection complete 2:",data);
            },//需要至少传入 success / fail / complete 参数中的一个
            success:function(data){
                //console.log("__app Connection success:",data);
            },
            fail:function(err){
                //console.log("__app Connection fail:",err);
            }
        });
        
        let me=this;
        socket.onOpen(function (res) {
            console.log('__app onOpen', res);
            if(me.onopen)
                me.onopen(res);
        });
        
        socket.onClose(function(e){
            if(me.onclose)
                me.onclose(e);
            console.log('__app onClose',e);
        });
        socket.onError(function(e){
            if(me.onerror)
                me.onerror(e);
            console.error('__app onError',e);
        });
        
        socket.onMessage(function (res) {
            console.log('__app onMessage '+(++rCount),res.data);
            if(me.onmessage)
                me.onmessage(res);
        });
        this.__socket=socket;
    }
    send(data){
        console.log('__app sned '+(++sCount),data)
        //if(sCount==2) throw new Error('Test');
        this.__socket.send({data:data});
    }
}
// global.uniWebSocket = uniWebSocket;

/* global global */

/**
 * WHATWG WebSockets API
 * https://www.w3.org/TR/websockets/
 *
 * Interface to use the web socket protocol
 *
 * Used implementations:
 * - supported browsers: built-in in WebSocket global
 *   https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Browser_compatibility
 * - nodejs: use standard-compliant 'ws' module
 *   https://www.npmjs.com/package/ws
 */
function getWebSocketImplementation () {
    console.info('getWebSocketImplementation');
    let WebSocketImplementation = undefined;
    try{
        WebSocketImplementation = uniWebSocket;// uniapp
        console.log('shims 1');
    }catch(e){
        console.warn(e);
    }

    if (typeof WebSocketImplementation === 'undefined') {
        console.log('shims 2');
        WebSocketImplementation = global.WebSocket
    }
    console.info('getWebSocketImplementation',WebSocketImplementation);
    if (typeof WebSocketImplementation === 'undefined') {
        console.log('shims 3');
        try {
            WebSocketImplementation = require('ws');
        } catch (err) {
            console.info('getWebSocketImplementation',err);
            throw new Error('You must install the "ws" package to use Strophe in nodejs.');
        }
    }
    console.info('getWebSocketImplementation2', WebSocketImplementation);
    return WebSocketImplementation
}
export const WebSocket = getWebSocketImplementation()

/**
 * DOMParser
 * https://w3c.github.io/DOM-Parsing/#the-domparser-interface
 *
 * Interface to parse XML strings into Document objects
 *
 * Used implementations:
 * - supported browsers: built-in in DOMParser global
 *   https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#Browser_compatibility
 * - nodejs: use 'xmldom' module
 *   https://www.npmjs.com/package/xmldom
 */
function getDOMParserImplementation () {
    let DOMParserImplementation = global.DOMParser
    if (typeof DOMParserImplementation === 'undefined') {
        try {
            DOMParserImplementation = require('xmldom').DOMParser;
        } catch (err) {
            throw new Error('You must install the "xmldom" package to use Strophe in nodejs.');
        }
    }
    return DOMParserImplementation
}
export const DOMParser = getDOMParserImplementation()

/**
 *  Gets IE xml doc object. Used by getDummyXMLDocument shim.
 *
 *  Returns:
 *    A Microsoft XML DOM Object
 *  See Also:
 *    http://msdn.microsoft.com/en-us/library/ms757837%28VS.85%29.aspx
 */
function _getIEXmlDom () {
    const docStrings = [
        "Msxml2.DOMDocument.6.0",
        "Msxml2.DOMDocument.5.0",
        "Msxml2.DOMDocument.4.0",
        "MSXML2.DOMDocument.3.0",
        "MSXML2.DOMDocument",
        "MSXML.DOMDocument",
        "Microsoft.XMLDOM"
    ];
    for (let d = 0; d < docStrings.length; d++) {
        try {
            // eslint-disable-next-line no-undef
            const doc = new ActiveXObject(docStrings[d]);
            return doc
        } catch (e) {
            // Try next one
        }
    }
}

/**
 * Creates a dummy XML DOM document to serve as an element and text node generator.
 *
 * Used implementations:
 *  - IE < 10: avoid using createDocument() due to a memory leak, use ie-specific
 *    workaround
 *  - other supported browsers: use document's createDocument
 *  - nodejs: use 'xmldom'
 */
export function getDummyXMLDOMDocument () {
    // nodejs
    if (typeof document === 'undefined') {
        try {
            const DOMImplementation = require('xmldom').DOMImplementation;
            return new DOMImplementation().createDocument('jabber:client', 'strophe', null);
        } catch (err) {
            throw new Error('You must install the "xmldom" package to use Strophe in nodejs.');
        }
    }
    // IE < 10
    if (
        document.implementation.createDocument === undefined ||
        document.implementation.createDocument && document.documentMode && document.documentMode < 10
    ) {
        const doc = _getIEXmlDom();
        doc.appendChild(doc.createElement('strophe'));
        return doc
    }
    // All other supported browsers
    return document.implementation.createDocument('jabber:client', 'strophe', null)
}

