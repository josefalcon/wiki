var elasticsearch = require('elasticsearch');
var fs = require('fs');

var host = process.env["ES_PORT_9200_TCP_ADDR"];
var port = process.env["ES_PORT_9200_TCP_PORT"];

var client = new elasticsearch.Client({
  host: host + ':' + port
});

client.indices.putTemplate({
  name: 'wik',
  body: fs.readFileSync('template.json').toString()
})
.then(r => console.log('Created index template'))
.catch(e => console.error(e));
