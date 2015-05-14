var server = {};
if (process.env.NODE_ENV === 'development')
  server.NODE_ENV = process.env.NODE_ENV;

Inject.obj('server', server);