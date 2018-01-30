const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(3400).sockets;



//connection to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db) {
  if (err) {
    throw err;
  }
  console.log('connection ongoing~');

  //socket.io
  io.on('connection', function(socket) {
    let chat = db.collection('chats');


    // create function to send status
    sendStatus = function(s) {
      socket.emit('status', s);
    }


    //get chats from mongo

    chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
      if (err) {
        throw err;
      }
      //emit messages
      socket.emit('output', res);
    });


    socket.on('input', function(data) {
      let name = data.name;
      let message = data.message;
      console.log(name + " ~ " + message);
      // check for name and message
      if (name === '' || message === '') {
        sendStatus('please enter name and message');
      }
      else {
        // add to db
        chat.insert({name: name, message: message}, function() {
          io.emit('output', [data]);

          sendStatus({
            message: 'Message sent',
            clear: true
          });
        });
      }
    });


    // handle clear
    socket.on('clear', function (data) {
      //remove all chats
      chat.remove({}, function () {
        socket.emit('cleared');
      });
    });

  });
});
