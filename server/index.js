var Hapi = require('hapi'),
    HulaHoop = require('hula-hoop');

var server = new Hapi.Server(8000);

var appName = 'throax-seed';

// Setup resource handling
HulaHoop.api.resourceLoader.register(appName, [
  {name: 'main', version: '1.0.0', path: './build'}
]);
server.route([
  {
    path: '/r/{path*}',
    method: 'GET',
    handler: HulaHoop.endpoints.resources()
  }
]);

// Setup the user endpoint routing
var pageHandler = HulaHoop.endpoints.page(appName, {
  host: 'localhost:8000',
  resourceRoot: '/r/'
});

server.route(
  HulaHoop.api.resourceLoader.routes().map(function(route) {
    return {
      path: route,
      method: 'GET',
      handler: pageHandler,
      config: {
        cache: {
          expiresIn: 5*60*1000,
          privacy: 'private'
        }
      }
    };
  })
);


/////////////////////////
// Offline Hack for Demo

server.route({
  path: '/data',
  method: 'GET',
  handler: {
    file: __dirname + '/../data.json'
  },
  config: {
    cache: {
      expiresIn: 5*60*1000
    }
  }
});


server.start();
