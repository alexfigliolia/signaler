export const clients = {};

export const addClient = (clientID, socket) => {
  if(clients[clientID]) delete clients[clientID];
  clients[clientID] = socket;
  console.log(Object.keys(clients));
}

export const removeClient = (clientID) => {
  delete clients[clientID];
  console.log(Object.keys(clients));
}

export const generateClientId = (key) => {
  let clientId = randomId();
  if (!clients[clientId]) {
    return clientId;
  }
  while (!!clients[clientId]) {
    clientId = randomId();
  }
  return clientId;
};

const randomId = () => {
  return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
};