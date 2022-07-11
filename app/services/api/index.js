'use strict'
/**
 * This modules provides a REST API over any given MongoDB
 * connection. It is fully dynamic and allows the consumer 
 * to view the full API specification by navigating to the 
 * following URL: localhost:3000/documentation/
 */
module.exports = async function (fastify, opts) {
  console.log('Data service started...');
  function getEntity(database, collection) {
    // const db = fastify.mongo.db(database);
    const entity = fastify.mongo[database].db.collection(collection);
    return entity;
  }
  //
  // getProp
  // Reference: https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab
  // Usage: "pipeline[0].$match.modified_date.$gt"
  //
  function getProp(object, keys, defaultVal) {
    keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
    object = object[keys[0]];
    if (object && keys.length > 1) {
      return getProp(object, keys.slice(1), defaultVal);
    }
    return object === undefined ? defaultVal : object;
  }
  // function dateParser(key, value) {
  //   if (typeof value === 'string') {
  //     if (Date.parse(value)) {
  //       return new Date(value);
  //     }
  //   }
  //   return value;
  // }
  // function reviver(key, value) {
  //   if (typeof value === 'string') {
  //     if (Date.parse(value)) {
  //       return new Date(value);
  //     } else if (key === '_id') {
  //       return require('mongodb').ObjectId(value);
  //     }
  //   }
  //   return value;
  // }
  function reviver(key, value) {
    if (typeof value === 'string') {
      if (/\d{4}-\d{1,2}-\d{1,2}/.test(value) ||
        /\d{4}\/\d{1,2}\/\d{1,2}/.test(value)) {
        return new Date(value);
      } else if (key === '_id') {
        return require('mongodb').ObjectId(value);
      }
    }
    return value;
  }
  //
  // List Databases
  //
  fastify.get('/databases',
    {
      schema: {
        params: {}
      }
    },
    async (req, reply) => {
      const databases = require('../../../databases.json');
      fastify.io.sockets.emit('lobby', databases);
      return databases;
    }
  );
  //
  // List Collections
  //
  fastify.get('/:database/collections',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name for listing collections',
              summary: 'The database name',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const { database } = req.params;
      const result = await fastify.mongo[database].db.listCollections().toArray();
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database};
    }
  );
  //
  // Run Command
  //
  fastify.get('/:database/runCommand',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            command: {
              description: 'The command to execute as a JSON string',
              summary: 'The command to execute',
              type: 'string'
            }
          },
          required: [
            'command'
          ]
        }
      }
    },
    async (req, reply) => {
      const { database } = req.params;
      const { command = null } = req.query;
      let query = {};
      if (command) {
        query = JSON.parse(command, reviver);
      }
      const result = await fastify.mongo[database].db.command(query);
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database};
    }
  );
  //
  // Delete (Delete)
  //
  fastify.delete('/:database/:collection/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            },
            id: {
              description: 'The id of the document',
              summary: 'The id',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const { database, collection, id } = req.params;
      const entity = getEntity(database, collection);
      const _id = require('mongodb').ObjectId(id);// cant use reviver here as param
      const result = await entity.deleteOne({ _id });
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({ status: 'Not found!' });
      }
      return result.deletedCount;
      // return {database, collection, id, _id, result};
    }
  );
  //
  // Delete (Delete Many)
  //
  fastify.delete('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            }
          },
          required: []
        }
      }
    },
    async (req, reply) => {
      const { database, collection, id } = req.params;
      const { filter } = req.query;
      let query = {};
      if (filter) {
        query = JSON.parse(filter, reviver);
        if (query._id) {
          query._id = require('mongodb').ObjectId(query._id);
        }
      }
      const entity = getEntity(database, collection);
      const result = await entity.deleteMany(query);
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({ status: 'Not found!' });
      }
      return result.deletedCount;
      // return {database, collection};
    }
  );
  //
  // Get (Retreive)
  //
  fastify.get('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            },
            orderBy: {
              description: 'The orderBy expression as a JSON string',
              summary: 'The orderBy expression',
              type: 'string'
            },
            limit: {
              description: 'The limit ',
              summary: 'The limit',
              type: 'integer'
            },
            skip: {
              description: 'The ,skip ',
              summary: 'The skip',
              type: 'integer'
            },
            fo: {
              description: 'The find one flag',
              summary: 'Find one',
              type: 'boolean'
            },
            f: {
              description: 'The fields object',
              summary: 'The fields object',
              type: 'string'
            },
            c: {
              description: 'Count the number of documents',
              summary: 'Count',
              type: 'boolean'
            }
          },
          required: []
        }
      }
    },
    async (req, reply) => {
      const { database, collection } = req.params;
      const { filter, orderBy, limit = 0, skip = 0, fo = false, f = null, c = false } = req.query;
      let query = {};
      let sort = {};
      let project = {};
      let findonerec = fo;
      if (filter) {
        query = JSON.parse(filter, reviver);
        if (query._id) {
          query._id = require('mongodb').ObjectId(query._id);
          findonerec = true;
        }
      }
      if (orderBy) {
        sort = JSON.parse(orderBy);
      }
      if (f) {
        console.log(f);
        project = JSON.parse(f);
      }
      const entity = getEntity(database, collection);
      let result;
      if (findonerec) {
        if (f) {
          result = await entity.findOne(query, { projection: project });
        } else {
          result = await entity.findOne(query);
        }
      } else {
        if (f) {
          result = await entity.find(query).project(project).sort(sort).skip(+skip).limit(+limit).toArray();
        } else {
          if (c) {
            result = await entity.find(query).count();
          } else {
            result = await entity.find(query).sort(sort).skip(+skip).limit(+limit).toArray();
          }
        }
      }
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database, collection};
    }
  );
  //
  // Get By Id (Retreive one)
  //
  fastify.get('/:database/:collection/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            },
            id: {
              description: 'The document id',
              summary: 'The document id',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const { database, collection, id } = req.params;
      const entity = getEntity(database, collection);
      // const _id = new ObjectId(id);
      const _id = require('mongodb').ObjectId(id);
      const result = await entity.findOne({ _id });
      fastify.io.sockets.emit('lobby', result);
      // return {database, collection, id, _id, result};
      return result;
    }
  );
  //
  // Post (Create)
  //
  // Post (Create)
  //
  fastify.post('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const { database, collection } = req.params;
      const entity = getEntity(database, collection);
      const obj = JSON.parse(req.body, reviver);
      let result;
      if (Array.isArray(obj)) {
        result = await entity.insertMany(obj);
        fastify.io.sockets.emit('lobby', result.insertedIds);
        return result.insertedIds;
      } else {
        result = await entity.insertOne(obj);
        fastify.io.sockets.emit('lobby', result.insertedId);
        return result.insertedId;
      }
      // return {database, collection};
    }
  );
  //
  // Put (Update)
  //
  fastify.put('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            }
          },
          required: [
            'filter'
          ]
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const { database, collection } = req.params;
      const { filter } = req.query;
      console.log(" fastify.put('/:database/:collection'")
      console.log('database', database)
      console.log('filter', filter)
      // 
      console.log('\n\n\n')
      // let result = 'test'
      let query = {};
      if (filter) {
        query = JSON.parse(filter, reviver);
      }
      console.log('query', query)

      const entity = getEntity(database, collection);
      console.log('req.body', req.body)

      const obj = req.body//JSON.parse(req.body, reviver);

      //  const obj = req.body;
      console.log('obj', obj);
      let result;
      if (Array.isArray(obj)) {
        //delete obj._id in many 
        result = await entity.updateMany(query, { $set: obj });
        fastify.io.sockets.emit('lobby', result);
      } else {
        delete obj._id;
        result = await entity.updateOne(query, { $set: obj });

        fastify.io.sockets.emit('lobby', result);
      }
      return result;
      // return {database, collection};
    }
  );


  // Put (Update an array of docs)
  //
  fastify.put('/:database/:collection/:array',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            }
          },
          // required: [
          //   'filter'
          // ]
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const { database, collection, array } = req.params;
      const { filter } = req.query;
      console.log('batch put array database', database)
      //   console.log('filter', filter)
      // 
      console.log('\n\n\n')
      //// let result = 'test'
      let query = {};
      //  if (filter) {
      //    query = JSON.parse(filter, reviver);
      //  }
      // console.log('query', query)
      console.log('array', array)

      const entity = getEntity(database, collection);
      console.log('entity', entity)

      const obj = req.body//JSON.parse(req.body, reviver);

      //  const obj = req.body;
      //  console.log('obj',obj);
      let result = true;
      // if (Array.isArray(obj)) {
      //   //delete obj._id in many 
      //   result = await entity.updateMany(query, {$set: obj});
      //   fastify.io.sockets.emit('lobby', result);
      // } else {
      //    delete obj._id;
      //   result = await entity.updateOne(query, {$set: obj});

      //   fastify.io.sockets.emit('lobby', result);
      // }
      let ct = 0
      let dataarray = obj.data
    
      for (const rec of dataarray) {
        ct++
        //   console.log(ct, rec.SupportingDocFilename)
     
        // result = await entity.updateOne(query, { $set: rec });
        // ////////////////
        // // const _id = require('mongodb').ObjectId(rec._id);// cant use reviver here as param
        query = { _id: require('mongodb').ObjectId(rec._id) } //obj._id};
        // console.log(ct, rec.SupportingDocFilename,rec.response,rec.reason,rec.account,query)
     
        
        // // delete rec._id;
        // let newobj = {}
        let newobj = {}
         newobj.response = rec.response||""
         console.log(ct, rec.SupportingDocFilename,newobj.response,query)
     
        newobj.reason = rec.reason||""
        newobj.account = rec.account||""
        // console.log(ct,  query, newobj)
       // console.log(ct,  rec.SupportingDocFilename,entity, query, newobj)


        let result = await entity.updateOne(query, { $set: newobj });
        // return result;
        //[{id:_id},query,obj,result]};
        /////////////////
      }
      return { 'data': 'updated' }
      // return {database, collection};
    }
  );


};

module.exports.autoPrefix = '/api';
