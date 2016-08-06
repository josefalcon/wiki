var elasticsearch = require('elasticsearch');
var fs = require('fs');
var XmlStream = require('xml-stream');


var client = new elasticsearch.Client({
  host: '192.168.99.100:32769'
});

// https://dumps.wikimedia.org/enwiktionary/latest/

var abstract = fs.createReadStream('enwiktionary-latest-abstract.xml');
var xml = new XmlStream(abstract);

var count = 0;
var bulk = [];

xml.preserve('doc', true);
xml.collect('subitem');
xml.on('endElement: doc', doc => {
  if (doc.abstract.$text !== '==English==') return;

  count++;
  var doc = {
    title: doc.title.$text.substring('Wiktionary: '.length),
    url: doc.url.$text
  };

  bulk.push({ index:  { _index: 'wiktionary', _type: 'doc', _id: doc.url } });
  bulk.push(doc);

  if (count % 1000 == 0) {
    console.log(count, 'sending batch...');
    client.bulk({body: bulk})
      .catch(e => console.error(e));
    bulk.length = 0;
  }
});
