
var fs = require('fs');
var loadStream = require('./loader');

var stru = JSON.parse(loadStream());
console.log("##############################");
console.log(JSON.stringify(stru));






