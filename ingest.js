var elasticsearch = require('elasticsearch');
var fs = require('fs');
var byline = require('byline');
var docopt = require('docopt').docopt;

var doc = `
Elasticsearch Ingestion

Usage:
  ingest wikipedia  <file> <index> [--host=<host>] [--port=<port>] [--type=<type>]
  ingest wiktionary <file> <index> [--host=<host>] [--port=<port>] [--type=<type>]
  ingest -h | --help

Options:
  -h --help      Show this screen.
  --host=<host>  ES host [default: localhost]
  --port=<port>  ES port [default: 9200]
  --type=<type>  Index type [default: doc]
`

var argv = docopt(doc);

var client = new elasticsearch.Client({
  host: argv['--host'] + ':' + argv['--port']
});

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

  bulk.push({ index:  { _index: argv['<index>'], _type: argv['--type'], _id: doc.id } });
  bulk.push(doc);

  if (count % 1000 == 0) {
    console.log(count, 'sending batch...');
    client.bulk({body: bulk}).catch(e => console.error(e));
    bulk.length = 0;
  }
});
