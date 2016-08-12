var elasticsearch = require('elasticsearch');
var fs = require('fs');
var byline = require('byline');
var through2 = require('through2');
var ESBulkStream = require('elasticsearch-bulk-index-stream');
var docopt = require('docopt').docopt;

var doc = `
Elasticsearch Ingestion

Usage:
  ingest wikipedia  <file> <index> [--host=<host>] [--port=<port>] [--type=<type>] [--dry-run]
  ingest wiktionary <file> <index> [--host=<host>] [--port=<port>] [--type=<type>] [--dry-run]
  ingest -h | --help

Options:
  -h --help      Show this screen.
  --host=<host>  ES host [default: localhost]
  --port=<port>  ES port [default: 9200]
  --type=<type>  Index type [default: doc]
  --dry-run      Only print the documents that would be sent to ES
`

var argv = docopt(doc);

var client;
if (!argv['dry-run']) {
  client = new elasticsearch.Client({
    host: argv['--host'] + ':' + argv['--port']
  });
}

// wget -c https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-abstract.xml
// now relies on precomputed pagerank json data

var pages = byline(fs.createReadStream(argv['<file>'], { encoding: 'utf8' }));

var count = 0;
var bulk = [];

var site = argv.wikipedia ? 'wikipedia' : 'wiktionary';
var root = `https://en.${site}.org/wiki/`

pages
  .pipe(through2.obj(function(chunk, enc, callback) {
    var document = JSON.parse(chunk);
    document.url = root + document.title;
    document.title = document.title.replace(/_/g, ' ');

    this.push({
      index: argv['<index>'],
      type: argv['--type'],
      id: document.id,
      body: document
    })
    callback()
   }))
   .pipe(new ESBulkStream(client, { highWaterMark: 5000 }))
   .on('error', function(error) {
      console.log(error);
    })
    .on('finish', function() {
      client.close();
    });
