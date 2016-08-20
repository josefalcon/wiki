var fs = require('fs');
var XmlStream = require('xml-stream');
var docopt = require('docopt').docopt;

var doc = `
Convert Wiktionary abstract xml to json

Usage:
  wiktionary <src> <dst>
  wiktionary -h | --help

Options:
  -h --help      Show this screen.
`
var argv = docopt(doc);
var ps = fs.createReadStream(argv['<src>']);
var ws = fs.createWriteStream(argv['<dst>']);

// wget -c https://dumps.wikimedia.org/enwiktionary/latest/enwiktionary-latest-abstract.xml

var xml = new XmlStream(ps);

xml.preserve('doc', true);
xml.collect('subitem');
xml.on('endElement: doc', doc => {
  if (doc.abstract.$text !== '==English==') return;

  ws.write(JSON.stringify({
    title: doc.title.$text.substring('Wiktionary: '.length),
    url: doc.url.$text,
    id: doc.url.$text
  }) + '\n');
});
