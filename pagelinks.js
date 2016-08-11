var fs = require('fs');
var StreamSnitch = require('stream-snitch');

var ps = fs.createReadStream('../cword/enwiki-latest-pagelinks.sql');
var ws = fs.createWriteStream('enwiki-latest-pagelinks.json');

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
