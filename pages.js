var fs = require('fs');
var StreamSnitch = require('stream-snitch');

var ps = fs.createReadStream('../cword/enwiki-latest-page.sql');
var ws = fs.createWriteStream('enwiki-latest-page-no-redirects2.json');

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
