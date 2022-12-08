'use strict'

const fp = require('fastify-plugin');
const fs = require('fs');


module.exports = fp(async (fastify, opts) => {
  console.log('Registering databases...');
  fastify.register(require('@fastify/mongodb'), {  useUnifiedTopology: true,useNewUrlParser: true,url: process.env.MONGODB_URLbrm, name: 'todo' } )
  fastify.log.info('/pi 002===plugin================fastify mongodb======');

});

