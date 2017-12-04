'use strict';

var start = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return server.start();

          case 3:
            _context.next = 9;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0);
            process.exit(1);

          case 9:
            console.log('Server running at:', server.info.uri);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 5]]);
  }));

  return function start() {
    return _ref.apply(this, arguments);
  };
}();

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _clients = require('./clients');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var server = new _hapi2.default.Server({ 'host': 'localhost', 'port': 9000 });

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

;

start();