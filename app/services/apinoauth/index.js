
'use strict'


module.exports = async function (fastify, opts) {
  console.log('Data service started...');

  const fs = require('fs-extra')
  const io = fastify.io // socketio
  const drive = process.env.drive;
  const userdrive = process.env.userdrive;
  // console.log(userdrive)

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //   function sleep(ms) {
  //     return new Promise(resolve => setTimeout(resolve, ms));
  // }

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

  function reviver_reviver(key, value) {
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
  function reviver(key, value) {
    if (typeof value === 'string') {

      if (/\d{4}-\d{1,2}-\d{1,2}/.test(value) ||
        /\d{4}\/\d{1,2}\/\d{1,2}/.test(value)) {
        return new Date(value);
      } else if (key === '_id') {
        return require('mongodb').ObjectId(value);
      } else if (key === 'file') {
        //pdf names have a timestap
        return value;
      }
    }
    return value;
  }
  //
  // Post (Create)
  //

  fastify.post('/:database/:collection', {
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
      let { database, collection } = req.params;
      const entity = getEntity(database, collection);

      const bod = JSON.stringify(req.body)

      const obj = JSON.parse(bod, reviver);

      let result;

      if (collection === 'copyrecs') {
        let movefrombase = `${drive}:\\docs\\images\\Claims\\${obj.wcid}\\${obj.type}\\`
        let movetobase = `${drive}:\\docs\\_pdfexport\\${obj.username}\\`
        console.log('movetobase', movetobase)
        let movefrom
        let moveto
        for (const rec of obj.copyrecs) {
          movefrom = `${movefrombase}${rec}.pdf`
          moveto = `${movetobase}${rec}.pdf`
          // let hname1 = path.resolve(`${drive}:/docs/Images/pdf/checks/Check1.html`); // pre exit 1st check
          try {
            await fs.copy(movefrom, moveto)
            await sleep(500) // not sure why it fauils w/o this
          } catch (e) {
            fastify.log.error('failed to copy ', movefrom, moveto)
            console.error('failed to copy ', e, movefrom, moveto)
          }


        }
        reply.send({ status: 'ok' })//, id: result.insertedId.toString() })


      } else {

        if (Array.isArray(obj)) {
          result = await entity.insertMany(obj);
          console.log('result ', result)//,result.insertedIds.toString())
          console.log('result.insertedIds ', result.insertedIds)//,result.insertedIds.toString())

          return result//.insertedIds.toString();
        } else {
          result = await entity.insertOne(obj);
          console.log('result.insertedIds ', result.insertedId.toString())

          obj._id = result.insertedId.toString()
          // console.log('sockets ', obj)


          // let headobj = { 'Authorization': `Bearer ${token}` }
          // 
          if (collection === 'froi' || collection === 'sroi') {
            collection += 'noauth'
            console.log('collection ', collection)

            fastify.inject({
              method: 'post',
              // headers: headobj,
              payload: obj,
              url: `/api/brm/v1/createpdf/${collection}`

            }, (err, response) => {
              if (err) {
                next(err)
              } else {

              }
            })
          }

          // reply.send({ status: 'ok' })//, id: result.insertedId.toString() })
          // @guivic/fastify-socket.io'
          // f

          fastify.io.emit('lobby', obj);
          console.log(' fastify.io.emit ', obj)
          fastify.io.sockets.emit('lobby', obj);
          console.log('fastify.io.sockets ', obj)
          var resp = { status: 'ok' };
          console.log(resp);
          reply.send(resp);

        }


      }
    });
  fastify.get('/:database/:collection/:id', {
    // preValidation: [fastify.authenticate],
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

      const {
        database,
        collection,
        id
      } = req.params;
      const entity = getEntity(database, collection);
      // const _id = new ObjectId(id);
      console.log('get _id===collection========= ', collection)
      const _id = require('mongodb').ObjectId(id);
      console.log(`===============reply======================${_id} --  -- ${req.session.authenticated}`) //[0].lastName} `)
      // if (req.session.authenticated) {

      const result = await entity.findOne({
        _id
      });
      // 
      fastify.io.sockets.emit('lobby', result);
      //   return {database, collection, id, _id, result};
      //  } else result = 'not autenticated'
      // console.log('===result========= ', result)
      // // return {result};
      // return { data: result };

      var resp = { "data": result };
      console.log(resp);
      reply.send(resp);

    }
  );
  // Get (Retreive)
  // http://localhost:8080/apinoauth/brm/user/5865d34214e11d6bfafd191d
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
        },

      },

    },
    async (req, reply) => {
      const { database, collection } = req.params;
      const { filter, orderBy, limit = 0, skip = 0, fo = false, f = null, c = false, ci, filterregex } = req.query;
      let query = {};
      let sort = {};
      let project = {};
      let findOne = fo;


      if (filter) {
        console.log('filter', filter)
        // query = JSON.parse(filter);//, reviver);
        query = JSON.parse(filter, reviver);

        console.log('query', query)
      }

      // console.log("filter", filter) //[0].lastName} `)

      if (orderBy) {

        // sort = JSON.stringify(orderBy)
        sort = JSON.parse(orderBy)//, reviver);
      }
      // if(sort==="{POID:-1}") sort={POID:-1}
      // console.log('orderBy  ', ' sort ', sort)
      // console.log('limit ', limit)
      // console.log('query +', query)



      if (f) {
        console.log(f);
        project = JSON.parse(f);
      }
      // console.log('project +', project)

      const entity = getEntity(database, collection);
      let result;
      if (findOne) {
        if (f) {
          result = await entity.findOne(query, {
            projection: project
          });
        } else {
          result = await entity.findOne(query);
        }
      } else {
        if (f) {
          // let pp={POID:1,VendorID:1}
          result = await entity.find(query).project(project).sort(sort).skip(+skip).limit(+limit).toArray();
        } else {
          if (c) {
            result = await entity.find(query).count();
          } else {
            result = await entity.find(query).sort(sort).skip(+skip).limit(+limit).toArray();
            //  result = await entity.find(query).toArray();
          }
        }
      }

      // @guivic/fastify-socket.io'
      fastify.io.sockets.emit('lobby', result);
      console.log('result', result.length)
      console.log('=======================')


      // return result;
      return ({ "data": result })
    }
  );



  //     return result;

  //   });

};



module.exports.autoPrefix = '/apinoauth';
