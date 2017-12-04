import Hapi from 'hapi'
import socketio from 'socket.io';
import url from 'url';
import { clients, addClient, removeClient, generateClientId } from './clients';

const server = new Hapi.Server({ 'host': 'localhost', 'port': 9000 });

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
    io.to(clients[candidate.to].id).emit('candidate', candidate.candidate);
  });

  socket.on('accepted', (user) => {
    io.to(clients[user.to].id).emit('accepted', user.from);
  });

  socket.on('offer', (offer) => {
    io.to(clients[offer.to].id).emit('offer', {offer: offer.offer, from: offer.from});
  });

  socket.on('answer', (answer) => {
    io.to(clients[answer.to].id).emit('answer', answer.answer);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    removeClient(socket.piperChatID);
    delete socket.piperChatID;
  });
});

async function start() {
  try {
      await server.start();
  }
  catch (err) {
      console.log(err);
      process.exit(1);
  }
  console.log('Server running at:', server.info.uri);
};

start();