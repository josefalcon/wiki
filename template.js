var elasticsearch = require('elasticsearch');
var fs = require('fs');
var docopt = require('docopt').docopt;

var doc = `
Index template uploader

Usage:
  template <template> <name> [--host=<host>] [--port=<port>]
  template -h | --help

Options:
  -h --help      Show this screen.
  --host=<host>  ES host [default: localhost]
  --port=<port>  ES port [default: 9200]
`

var argv = docopt(doc);

var client = new elasticsearch.Client({
  host: argv['--host'] + ':' + argv['--port']
});

client.indices.putTemplate({
  name: argv['<name>'],
  body: fs.readFileSync(argv['<template>']).toString()
})
.then(r => console.log('Uploaded index template'))
.catch(e => console.error(e));
