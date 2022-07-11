'use strict'
/**
 * This modules provides a REST API over any given MongoDB
 * connection. It is fully dynamic and allows the consumer 
 * to view the full API specification by navigating to the 
 * following URL: localhost:3000/documentation/
 */
module.exports = async function (fastify, opts) {
  console.log('Data service started...');


  const fs = require('fs-extra')
  const path = require('path')
  // used for client side for loops
  const items = [{
    _id: "61db7861fd3f2f64a6b1db31",
    Number: "60",
    Size: "10 x 10 in.",
    Category: "abstract",
    fix: null,
    Filename: "60.jpg",
    SortOrder: 60,
    CatImage: "",
    Year: "",
    Caption: "",
    Modal: "",
    Notes: "",
    tags: "",
    updatedAt: "2022-01-07T17:05:26.416Z",
    ThumbNail: "Y",
    Cat1: "abstract",
    Number: "60",
    Title: "Glow 1",
    Price: "",
    Medium: "Gold leaf, glass, and oil on panel"
  },
  {
    _id: "61db7861fd3f2f64a6b1db32",
    Number: "61",
    Size: "10 x 10 in.",
    Category: "abstract",
    fix: null,
    Filename: "61.jpg",
    SortOrder: 61,
    CatImage: "",
    Year: "",
    Caption: "",
    Modal: "",
    Notes: "",
    tags: "",
    updatedAt: "2022-01-07T17:05:26.416Z",
    ThumbNail: "Y",
    Cat1: "abstract",
    Number: "61",
    Title: "Glow 2",
    Price: "",
    Medium: "Gold leaf, glass, and oil on panel"
  },
  {
    _id: "61db7861fd3f2f64a6b1db33",
    Number: "62",
    Size: "10 x 10 in.",
    Category: "abstract",
    fix: null,
    Filename: "62.jpg",
    SortOrder: 62,
    CatImage: "",
    Year: "",
    Caption: "",
    Modal: "",
    Notes: "",
    tags: "",
    updatedAt: "2022-01-07T17:05:26.416Z",
    ThumbNail: "Y",
    Cat1: "abstract",
    Number: "62",
    Title: "Lily Pond",
    Price: "",
    Medium: "Oil and glass on wood panel"
  },
  {
    _id: "61db7861fd3f2f64a6b1db34",
    Number: "63",
    Size: "10 x 10 in.",
    Category: "abstract",
    fix: null,
    Filename: "63.jpg",
    SortOrder: 63,
    CatImage: "",
    Year: "",
    Caption: "",
    Modal: "",
    Notes: "",
    tags: "",
    updatedAt: "2022-01-07T17:05:26.416Z",
    ThumbNail: "Y",
    Cat1: "abstract",
    Number: "63",
    Title: "Comet",
    Price: "",
    Medium: "Oil and glass on wood panel"
    },
    ];


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


  // http:127.0.0.1:3000/apinj/nunjucks/test
  fastify.get("/nunjucks/test", async (request, reply) => {
   
    reply.view('templates/index.html', { title: 'Test page', hello: 'the world from greenport, ny' });
    // fails to load
 
  });


}
module.exports.autoPrefix = '/apinj'; 
   
//http://localhost:3000/apinj/nunjucks/test