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
var port = process.env.PORT || 9000;
server.connection({ host: '0.0.0.0', port: port, routes: { cors: true } });

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

io.on('connection', function (socket) {

  socket.on('connected', function (userdata) {
    var uniqueID = (0, _clients.generateClientId)();
    (0, _clients.addClient)(uniqueID, socket);
    io.to(socket.id).emit('uniqueID', uniqueID);
    socket.piperChatID = uniqueID;
  });

  socket.on('candidate', function (candidate) {
    if (candidate.to in _clients.clients) {
      io.to(_clients.clients[candidate.to].id).emit('candidate', candidate.candidate);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('accepted', function (user) {
    if (user.to in _clients.clients) {
      io.to(_clients.clients[user.to].id).emit('accepted', user.from);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('offer', function (offer) {
    if (offer.to in _clients.clients) {
      var image = null;
      if (offer.fromImage) image = offer.fromImage;
      io.to(_clients.clients[offer.to].id).emit('offer', { offer: offer.offer, from: offer.from, image: image });
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('answer', function (answer) {
    if (answer.to in _clients.clients) {
      io.to(_clients.clients[answer.to].id).emit('answer', answer.answer);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('remoteStream', function (stream) {
    if (socket.id in _clients.clients) io.to(socket.id).emit('remoteStream', stream);
  });

  socket.on('endChat', function (otherGuy) {
    if (otherGuy in _clients.clients) io.to(_clients.clients[otherGuy].id).emit('endChat', 'end the chat');
  });

  socket.on('busy', function (otherGuy) {
    if (otherGuy in _clients.clients) io.to(_clients.clients[otherGuy].id).emit('busy', 'This user is in another chat');
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