const fs = require('fs');
const http = require('http');
const https = require('https');

var Stream = require('stream').Transform;

exports.downloadImageToUrl = (url,fileName, callback) => {

    var client = http;
    if (url.toString().indexOf("https") === 0){
      client = https;
     }

    client.request(url, function(response) {                                        
      var data = new Stream();                                                    

      response.on('data', function(chunk) {                                       
         data.push(chunk);                                                         
      });                                                                         

      response.on('end', () => {                    
         fs.writeFileSync(`./public/images/uploads/${fileName}`, data.read());
         console.log("img upload Success");
      });                                                                         
   }).end();
};