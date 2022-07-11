# Services Folder

Services define routes within your application. Fastify provides an
easy path to a microservice architecture, in the future you might want
to independently deploy some of those.

In this folder you should define all the services that define the routes
of your web application.
Each service is a [Fastify
plugin](https://www.fastify.io/docs/latest/Plugins/), it is
encapsulated (it can have its own independent plugins) and it is
typically stored in a file; be careful to group your routes logically,
e.g. all `/users` routes in a `users.js` file. We have added
a `root.js` file for you with a '/' root added.

If a single file become too large, create a folder and add a `index.js` file there:
this file must be a Fastify plugin, and it will be loaded automatically
by the application. You can now add as many files as you want inside that folder.
In this way you can create complex services within a single monolith,
and eventually extract them.

If you need to share functionality between services, place that
functionality into the `plugins` folder, and share it via
[decorators](https://www.fastify.io/docs/latest/Decorators/).



mrg notes
generic
 //mailinglist
  { method: ['get'], path: '/api/v1/mailinglistparam', handler: 'MailinglistController.findone' },
  { method: ['get'], path: '/api/v1/mailinglist/:id', handler: 'MailinglistController.findone' },
  { method: ['get'], path: '/api/v1/mailinglistid/:id', handler: 'MailinglistController.findoneid' },
  { method: ['delete'], path: '/api/v1/mailinglist/delete', handler: 'MailinglistController.delete' },
  //OrgsController
  { method: ['get'], path: '/api/v1/orgs', handler: 'OrgsController.findorgs' },
  { method: ['get'], path: '/api/v1/orgs/:id', handler: 'OrgsController.findone' },
  { method: ['get'], path: '/api/v1/orgs/findcontacts/:id', handler: 'OrgsController.findcontacts' },
  { method: ['get'], path: '/api/v1/orgs/findall', handler: 'OrgsController.findall' },
  { method: ['get'], path: '/api/v1/orgs/findonemongo/:id', handler: 'OrgsController.findonemongo' },
  { method: ['put'], path: '/api/v1/orgs/update', handler: 'OrgsController.update' },
  { method: ['post'], path: '/api/v1/orgs/create', handler: 'OrgsController.create' },
  { method: ['get'], path: '/api/v1/publisher', handler: 'OrgsController.publisher' },


  //ArtistController
  { method: ['get'], path: '/api/v1/artist', handler: 'ArtistController.findartist' },
  { method: ['get'], path: '/api/v1/artistnames', handler: 'ArtistController.findartistnames' },
  // { method: ['get'], path: '/api/v1/artistcontent', handler: 'ArtistController.artistcontent' },
  { method: ['get'], path: '/api/v1/artist/:id', handler: 'ArtistController.findone' },
  { method: ['post'], path: '/api/v1/artist/create', handler: 'ArtistController.create' },
  { method: ['put'], path: '/api/v1/artist/update', handler: 'ArtistController.update' },



  // savedlists
  { method: ['get'], path: '/api/v1/savedlists/:id', handler: 'SavedlistsController.findone' },
  { method: ['get'], path: '/api/v1/savedlists', handler: 'SavedlistsController.findall' },
  { method: ['put'], path: '/api/v1/savedlists/update/:id', handler: 'SavedlistsController.update' },
  { method: ['put'], path: '/api/v1/savedlists/updatesl', handler: 'SavedlistsController.updatesl' },
  { method: ['post'], path: '/api/v1/savedlists/savemerge/:id', handler: 'SavedlistsController.saveMerge' },
  { method: ['get'], path: '/api/v1/savedlists/getinventory/:id', handler: 'SavedlistsController.getinventory' },
  { method: ['put'], path: '/api/v1/savedlists/delete/:id', handler: 'SavedlistsController.delete' },
  { method: ['post'], path: '/api/v1/savedlists/create/:id', handler: 'SavedlistsController.create' },
