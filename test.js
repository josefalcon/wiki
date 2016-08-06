var elasticsearch = require('elasticsearch');

var host = process.env["ES_PORT_9200_TCP_ADDR"];
var port = process.env["ES_PORT_9200_TCP_PORT"];

var client = new elasticsearch.Client({
  host: host + ':' + port
});

client.ping({
  requestTimeout: 30000,

  // undocumented params are appended to the query string
  hello: "elasticsearch"
}, function (error) {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});
