'use strict';

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _clients = require('./clients');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _hapi2.default.Server();

server.connection({ 'host': 'localhost', 'port': 9000 });

server.route({
  method: 'GET',
  path: '/',
  handler: function handler(request, reply) {
    reply('hello!');
  }
});

var io = (0, _socket2.default)(server.listener, {
  'reconnect': true,
  'reconnection delay': 500,
  'max reconnection attempts': 99999,
  'secure': true,
  'sync disconnect on unload': true
});

// When a socket connects, set up the specific listeners we will use.
io.on('connection', function (socket) {

  socket.on('connected', function (userdata) {
    var uniqueID = (0, _clients.generateClientId)();
    (0, _clients.addClient)(uniqueID, socket);
    io.to(socket.id).emit('uniqueID', uniqueID);
    socket.piperChatID = uniqueID;
  });

  socket.on('candidate', function (candidate) {
    io.to(_clients.clients[candidate.to].id).emit('candidate', candidate.candidate);
  });

  socket.on('accepted', function (user) {
    io.to(_clients.clients[user.to].id).emit('accepted', user.from);
  });

  socket.on('offer', function (offer) {
    io.to(_clients.clients[offer.to].id).emit('offer', { offer: offer.offer, from: offer.from });
  });

  socket.on('answer', function (answer) {
    io.to(_clients.clients[answer.to].id).emit('answer', answer.answer);
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected');
    (0, _clients.removeClient)(socket.piperChatID);
    delete socket.piperChatID;
  });
});

// Start the server
server.start(function () {
  console.log('Server running at:', server.info.uri);
});