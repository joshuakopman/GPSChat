var https = require('https');
function ServiceHandler(){

}
ServiceHandler.prototype.GetNeighborhoodByCoords = function(lat,lon,callback){

        var url = 'https://api.flickr.com/services/rest/?method=flickr.places.findByLatLon&api_key=58c6594cbce90ae5daaa7ae687e1149f&lat='+lat+'&lon='+lon+'&format=json&nojsoncallback=1';

        https.get(url, function(res) {
            var body = '';

            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function() {
                var data = JSON.parse(body)
                return callback(data.places.place[0].woe_name);
            });
        }).on('error', function(e) {
              console.log("Got error: ", e);
        });

}

module.exports = ServiceHandler;