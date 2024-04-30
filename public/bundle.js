(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

module.exports = function () {
  throw new Error(
    'ws does not work in the browser. Browser clients must use the native ' +
      'WebSocket object'
  );
};

},{}],2:[function(require,module,exports){
const WebSocket = require('ws');

const url = "127.0.0.1:3000";
const socket = new WebSocket('ws://' + url);

// Connect to server
socket.on('open', function () {
    console.log('Connection established.');

    socket.send('Hello Server, i\'m the client!');
});

// Handle incoming messages
socket.on('message', function (data) {
    console.log('Message from server:', data.toString());
});

// Error handling on connection
socket.on('error', function (error) {
    console.error('Connection Error:', error);
});

// Close connection
socket.on('close', function () {
    console.log('Connection closed.');
});

},{"ws":1}],3:[function(require,module,exports){
const script = require('./script');
const client = require('./client');
},{"./client":2,"./script":4}],4:[function(require,module,exports){


},{}]},{},[3]);
