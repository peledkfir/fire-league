var restify = require('restify');
// var less = require('less-middleware');

var DEFAULT_PORT = 6699;

//create the http server
var server = restify.createServer();

// //use less to extend css
// server.use(less({
//     src: __dirname + '/public',
//     compress: true
// }));

//serve static content
server.get(/\/?.*/, restify.serveStatic({
    directory: './app',
    default: 'index.html'
}));

//routing
//server.get('/hello/:name', respond);

//start the http server
server.listen(DEFAULT_PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});