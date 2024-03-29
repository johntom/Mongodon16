'use strict'

const fp = require('fastify-plugin');
const cors = require('@fastify/cors');

module.exports = fp(async (fastify, opts) => {
  const corsOpts = Object.assign ({}, {
    origin: '*',
    methods: ['DELETE','GET','POST','PUT']
  }, opts.cors);
 fastify.register(cors, corsOpts);

// fastify.register(cors, {
//     origin: "*",
//     methods: "GET,POST,PUT,PATCH,DELETE",
//   });

 
});
