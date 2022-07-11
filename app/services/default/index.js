'use strict'

module.exports = async function (fastify, opts) {
  console.log('Default service started...');

  fastify.get('/', 
    async (req, reply) => {
      const version = process.env.VERSION;
      const versionDate = process.env.VERSION_DATE;
      fastify.io.sockets.emit('lobby', {version});
      return {'version':version,'versionDate':versionDate };
    }
  );
};

module.exports.autoPrefix = '/meta'; 
