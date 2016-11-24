let path = require('path');
let stealTools = require('steal-tools');

let config =  {
  config: path.join(__dirname, 'package.json!npm')
};

let options = {
  minify: false,
  removeDevelopmentCode: true
};

stealTools.build(config, options)
  .then(function() {
    console.log('DONE');
  })
  .then(null, function(error) {
    console.log('FAILED');
    console.log(error);
  });
