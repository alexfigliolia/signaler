'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var clients = exports.clients = {};

var addClient = exports.addClient = function addClient(clientID, socket) {
  if (clients[clientID]) delete clients[clientID];
  clients[clientID] = socket;
  // console.log(Object.keys(clients));
};

var removeClient = exports.removeClient = function removeClient(clientID) {
  delete clients[clientID];
  // console.log(Object.keys(clients));
};

var generateClientId = exports.generateClientId = function generateClientId(key) {
  var clientId = randomId();
  if (!clients[clientId]) {
    return clientId;
  }
  while (!!clients[clientId]) {
    clientId = randomId();
  }
  return clientId;
};

var randomId = function randomId() {
  return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
};