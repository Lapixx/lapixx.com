"use strict";

/**
 * Creates a new XMLHttpRequest instance
 *
 * @returns {XMLHttpRequest}               The XHR instance
 */
 function createXHR() {

    // Firefox, Opera, Chrome, Safari
    if (window.XMLHttpRequest)
        return new XMLHttpRequest();

    if (!window.ActiveXObject)
        throw new Error("XMLHttpRequest not supported");

    // Internet Explorer
    try {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch (e) {
        return new ActiveXObject("Msxml2.XMLHTTP");
    }
}

/**
 * Defines a request message
 *
 * @param {object}      args
 * @param {string=}     args.url          URL to request
 * @param {string=}     args.method       HTTP method to use when sending (defaults to GET)
 * @param {boolean=}    args.cache        Whether to cache or not (defaults to false)
 * @param {object=}     args.params       Query parameters to attach to the url
 * @param {object=}     args.payload      Data to send with the request
 *
 * @constructor
 */
function createMessage(args) {

    var options = args || {};
    var message = {};

    // create the deferred promise
    message.promise = new Promise((resolve, reject) => {

        message.resolve = resolve;
        message.reject = reject;
    });

    // set the request method (POST/GET)
    message.method = options.method ? options.method.toUpperCase() : "GET";

    // build the request URL
    message.url = options.url;
    message.params = options.params;

    message.cache = options.cache || false;
    message.data = options.payload;

    return message;
}

/**
 * Formats an object with key-value pairs into a string that can be used as a URL query
 *
 * @param {Object}          params              The parameters to format - e.g. `{a: 2, b: 4}`
 * @returns {string}                            The query string         - e.g. `a=2&b=4`
 */
function formatQuery(params) {

    // loop over all keys
    return Object.keys(params)

    // ignore keys that have no value set
    .filter(key => params[key] !== undefined && params[key] !== null)

    // encode and pair keys with values
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))

    // glue params together
    .join("&");
}

/**
 * Sends a Message over XHR
 *
 * @param {Message}     message             Message to send
 *
 * @returns {void}
 */
function sendMessage(message, cb) {

    // append the query string to url
    var url = message.url;
    if (message.params)
        url += "?" + formatQuery(message.params);

    // append timestamp to prevent caching
    if (message.cache !== true)
        url += (message.params ? "&" : "?") + "_=" + (new Date().getTime());

    // create a new XHR object
    var xhr = createXHR();
    xhr.open(message.method, url, true);

    // format the data
    var data = message.data;

    if (data && !(data instanceof FormData)) {
        data = JSON.stringify(data);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }

    // handle successful load
    xhr.onload = function handleLoaded() {

        if (xhr.status !== 200)
            return message.reject({ status: xhr.status });

        // ok - parse json and return
        var res = JSON.parse(xhr.responseText);
        message.resolve(res);
    };

    // handle failed load
    xhr.onerror = function handleFailed() {

        message.reject({ status: -1 });
    };

    // send the request!
    return xhr.send();
}

/**
 * Creates a POST request and returns the result (pretty straight forward, eh?)
 *
 * @param {string}          url             URL to request
 * @param {object=}         payload         Data to send with the request as JSON
 *
 * @returns {Promise.<object>}              The result data from the request
 */
function postData(url, payload) {

    // wrap call in a message
    const message = createMessage({
        method  : "POST",
        url     : url,
        payload : payload
    });

    // send the message
    sendMessage(message);

    // return the deferred promise
    return message.promise;
}

/**
 * Creates a GET request and returns the result
 *
 * @param {string}          url             URL to request
 * @param {object=}         params          Parameters to attach to the url
 *
 * @returns {Promise.<object>}              The result data from the request
 */
function fetchData(url, params) {

    // wrap call in a message
    const message = createMessage({
        method  : "GET",
        url     : url,
        params  : params
    });

    // send the request
    sendMessage(message);

    // return the deferred promise
    return message.promise;
}
