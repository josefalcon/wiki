var elasticsearch = require('elasticsearch');
var fs = require('fs');
var byline = require('byline');
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

pages.on('data', line => {
  count++;

  var document = JSON.parse(line);
  document.url = root + document.title;
  document.title = document.title.replace(/_/g, ' ');

  if (argv['--dry-run']) {
    console.log(document);
    return;
  }

  bulk.push({ index:  { _index: argv['<index>'], _type: argv['--type'], _id: document.id } });
  bulk.push(document);

  if (count % 10000 == 0) {
    console.log(count, 'sending batch...');
    client.bulk({body: bulk}).catch(e => console.error(e));
    bulk.length = 0;
  }
});
