
npm install -D nodemon
npm install express socket.io moment mongodb


package.json:
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server",
    "dev": "nodemon server"
  }


Project setup:
--------------
1. npm init
2. git init, git add . , git commit -m "initial commit"

Method 1: A quick express server: (internally it uses 'http' module)
---------------------------------
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

Method 2: Server which explicitly use 'http' module in the express:
------------------------------------------------------------------
const http = require('http');
const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

Socket.io - wiring:
-------------------
const socketio = require('socket.io');
const io = socketio(server);
io.on('connection', socket => {   // called when a new client connects.
      console.log('A new WS connection'); 
      
      socket.emit('myEvent', 'Welcome to ChatCord!");                // 1. send msg to particular user
      socket.broadcast.emit('myEvent', 'A new user has joined");     // 2. Notify all other user except the user who are connecting
      // io.emit('myEvent', 'someMessage');                          // 3. Send msg to all including the user who are connected
      // socket.broadcast.to(roomNo).emit('myEvent', 'someMessage'); // 4. send msg to particular room

      socket.on('disconnect' () => {
          io.emit('myEvent', 'A user has left the chat');
      });

});


Notes:
1.
chatForm.addListener('submit', e => {              // submit button click inside a form
    e.preventDefault();
    const msg = e.target.elements.msg.value;       // inputbox inside a form
    // clear input
    e.target.elements.msg.value ='';
    e.target.elements.msg.focus();                 // bring back the focus for entering the next new text
})

2. Automatically move down the scroll after the new msg has been entered.
chatMessages.scrollTop = chatMessages.scrollHeight;
  



 
