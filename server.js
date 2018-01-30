const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(3400).sockets;



//connection to mongo
mongo.connect('mongodb://localhost/mongochat', (err, db) => {
  if (err) {
    throw err;
  }
  console.log('connection ongoing~');

  //socket.io
  io.on('connection', (socket) => {
    let chat = db.collection('chats');


    // create function to send status
    sendStatus = (s) => {
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


    socket.on('input', (data) => {
      let name = data.name;
      let message = data.message;

      // check for name and message
      if (name === '' || message === '') {
        sendStatus('please enter name and message');
      }
      else {
        // add to db
        chat.insert({name: name, message: message}, () => {
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
