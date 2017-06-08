var express = require("express");
var socket = require('socket.io');

var app = express();
var server = app.listen(3001);
var io = socket(server);

var history = [];
var canReset = true;

app.use(express.static('public'));

io.sockets.on('connection', function(socket){

  socket.emit('load', history);

  socket.on('mouse', function(data){
    io.sockets.emit('mouse',data);
    history.push(data);
  });

  socket.on('reset', function(){
    if(canReset){
       io.sockets.emit('reset',undefined);
       history = [];
       canReset = false;

       setTimeout(function(){canReset = true}, 30000);
     }
  });
});
