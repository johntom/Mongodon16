'use strict'
const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {

  fastify.get('/', (request, reply) => {
    console.log('fastify.io================', (fastify.io)); // Socket.io instance
  });



  fastify.register(require('fastify-socket.io'), {
   });

  fastify.ready(async err => {
    if (err) throw err;
    console.log('before connect', fastify.io);
    fastify.io.on('connect', (socket) => {
      console.log('fastify.connect');//, socket);
    })

    fastify.io.on('connection', (socket) => {
      console.log('fastify.connection');//, socket);
    })
    fastify.io.on('disconnect', (reason) => {
      console.log('fastify.disconnect', reason);
    })
  });

});



  // fastify.register(require('fastify-socket.io'), {
  //   // cors:{  origin: "http://127.0.0.1:8080",  methods: ["GET", "POST"],  allowedHeaders: ["my-custom-header"],  credentials: true  }
  //   // put your options here
  //   // cors: {
  //   //   origin: "http://localhost:8080",
  //   //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  //   // },
  // })



// // see server.js
// // https://github.com/guivic/fastify-socket.io
// 'use strict'
// const fp = require('fastify-plugin')

// module.exports = fp(async (fastify, opts) => {
//   // fastify.register(require('@guivic/fastify-socket.io'), opts, (error) => console.error(error));
//   // const io = fastify.io;
//   // console.log('/pi 001===plugin================fastify io======')//, fastify.io) // Socket.io instance

//   // let io = require("socket.io")(fastify.server);
//   fastify.register(require('fastify-socket.io'), {
//     // cors:{  origin: "http://127.0.0.1:8080",  methods: ["GET", "POST"] }
//   });

//   fastify.ready(async err => {
//     if (err) throw err;
//     console.log('fastify.connected', fastify.io);

//     fastify.io.on('connect', (socket) => {
//       console.log('fastify.connect', socket);
//     })

//     fastify.io.on('connection', (socket) => {
//       console.log('fastify.connect', socket);
//     })
//     fastify.io.on('disconnect', (reason) => {
//       console.log('fastify.disconnect', reason);
//     })
//     fastify.get('/', (request, reply) => {
//       console.log('/n002', (fastify.io)); // Socket.io instance
//     });

//     // io.on("connection", (socket) => {
//     //   socket.on("chat-message", (msg) => {
//     //     socket.broadcast.emit("chat-message", msg);
//     //   });

//     //   socket.on("joined", (name) => {
//     //     socket.broadcast.emit("joined", name);
//     //   });

//     //   socket.on("left", (name) => {
//     //     socket.broadcast.emit("left", name);
//     //   });

//     //   socket.on("typing", (data) => {
//     //     socket.broadcast.emit("typing", data);
//     //   });

//     //   socket.on("stoptyping", () => {
//     //     socket.broadcast.emit("stoptyping");
//     //   });

//     //  });

//   });
//   // fastify.get('/', (request, reply) => {
//   //   console.log('/n002', (fastify.io)); // Socket.io instance
//   //   let obj = {}
//   //   obj.place = 'World'
//   //   obj.message = 'Hello'
//   //   fastify.io.emit('lobby', obj);
//   //   console.log(' fastify.io.emit ', obj)
//   //   fastify.io.sockets.emit('lobby', obj);

//   // });

// });
// // see server.js
// // https://github.com/guivic/fastify-socket.io



