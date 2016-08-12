var fs = require('fs');
var StreamSnitch = require('stream-snitch');
var docopt = require('docopt').docopt;

var doc = `
Parse pages sql

Usage:
  pages <src> <dst>
  pages -h | --help

Options:
  -h --help      Show this screen.
`
var argv = docopt(doc);
var ps = fs.createReadStream(argv['<src>']);
var ws = fs.createWriteStream(argv['<dst>']);

// https://www.mediawiki.org/wiki/Manual:Page_table
var snitch = new StreamSnitch(/\((\d+),0,'([^,]*?)','[^,]*?',\d+,(\d+),.*?\)/gi);
snitch.on('match', m => {
  if (m[3] === '1') return;
  var record = {
    id: m[1],
    title: m[2].replace(/\\'/, '\'')
  }
  ws.write(JSON.stringify(record) + "\n")
});
ps.pipe(snitch);
