import Hapi from 'hapi'
import socketio from 'socket.io';
import url from 'url';
import { clients, addClient, removeClient, generateClientId } from './clients';

const server = new Hapi.Server();

const port = process.env.PORT || 9000;

server.connection({host: '0.0.0.0', port: port, routes: { cors: true } });

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('hello!');
  }
});

const io = socketio(
  server.listener,
  {
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 99999,
    'secure': true,
    'sync disconnect on unload': true
  }
);

// When a socket connects, set up the specific listeners we will use.
io.on('connection', (socket) => {

  socket.on('connected', (userdata) => {
    const uniqueID = generateClientId();
    addClient(uniqueID, socket);
    io.to(socket.id).emit('uniqueID', uniqueID);
    socket.piperChatID = uniqueID;
  });

  socket.on('candidate', (candidate) => {
    if(candidate.to in clients) {
      io.to(clients[candidate.to].id).emit('candidate', candidate.candidate);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('accepted', (user) => {
    if(user.to in clients) {
      io.to(clients[user.to].id).emit('accepted', user.from);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('offer', (offer) => {
    if(offer.to in clients) {
      io.to(clients[offer.to].id).emit('offer', {offer: offer.offer, from: offer.from});
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
    
  });

  socket.on('answer', (answer) => {
    if(answer.to in clients) {
      io.to(clients[answer.to].id).emit('answer', answer.answer);
    } else {
      io.to(socket.id).emit('friendConnectionError', 'There was a connection error. Your friend may be unavailable or in another vidchat');
    }
  });

  socket.on('remoteStream', (stream) => {
    console.log('emitting remote stream');
    if(socket.id in clients) {
      io.to(socket.id).emit(stream);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    removeClient(socket.piperChatID);
    delete socket.piperChatID;
  });
});

// Start the server
server.start(() => {
  console.log('Server running at:', server.info.uri);
});