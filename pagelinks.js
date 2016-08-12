var fs = require('fs');
var StreamSnitch = require('stream-snitch');
var docopt = require('docopt').docopt;

var doc = `
Parse pagelinks sql

Usage:
  pagelinks <src> <dst>
  pagelinks -h | --help

Options:
  -h --help      Show this screen.
`
var argv = docopt(doc);
var ps = fs.createReadStream(argv['<src>']);
var ws = fs.createWriteStream(argv['<dst>']);

// https://www.mediawiki.org/wiki/Manual:Pagelinks_table
var snitch = new StreamSnitch(/\((\d+),0,'([^,]*?)',0\)/gi);
snitch.on('match', m => {
  var record = {
    from_page_id: m[1],
    to_page_title: m[2].replace(/\\'/, '\'')
  }
  ws.write(JSON.stringify(record) + "\n")
});
ps.pipe(snitch);
