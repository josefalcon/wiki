var elasticsearch = require('elasticsearch');
var fs = require('fs');
var XmlStream = require('xml-stream');

var host = process.env["ES_PORT_9200_TCP_ADDR"];
var port = process.env["ES_PORT_9200_TCP_PORT"];

var client = new elasticsearch.Client({
  host: host + ':' + port
});

// wget -c https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-abstract.xml

var abstract = fs.createReadStream('enwiki-latest-abstract.xml');
var xml = new XmlStream(abstract);

var count = 0;
var bulk = [];

xml.preserve('doc', true);
xml.collect('subitem');
xml.on('endElement: doc', doc => {
  count++;
  var doc = {
    title: doc.title.$text.substring('Wikipedia: '.length),
    url: doc.url.$text
  };

  bulk.push({ index:  { _index: 'wikipedia', _type: 'doc', _id: doc.url } });
  bulk.push(doc);

  if (count % 1000 == 0) {
    console.log(count, 'sending batch...');
    client.bulk({body: bulk})
      .catch(e => console.error(e));
    bulk.length = 0;
  }
});
