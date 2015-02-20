var https = require('https');
var http = require('http');

function ServiceController(){

}

ServiceController.prototype.GetNeighborhoodByCoords = function(lat,lon,callback){
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

ServiceController.prototype.CheckImageIntegrity = function(url,callback){
    if(url.indexOf('https')> -1)
    {
        https.get(url, function(response) {
            callback(response.statusCode);
        });
    }
    else if(url.indexOf('http')> -1)
    {
         http.get(url, function(response) {
            callback(response.statusCode);
        });
    }
    else
    {
        callback(500);
    }
}

ServiceController.prototype.SetLightState = function(state){
        var boolState = state=="on" ;
        var lightSwitchObj = { on: boolState};
        var self = this;
        var Config = {};

        Config.hue = {};

        Config.hue.host = '68.173.226.51'
        Config.hue.port = 80;

        Config.hue.uri = '/api/joshkopman';

        this.options = {
            host: Config.hue.host,
            port: Config.hue.port,
            path: Config.hue.uri + '/groups/0/action',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        };
        var req = http.request(self.options, function(res)
        {
            var output = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function() {
             //   var obj = JSON.parse(output);
              //  onResult(res.statusCode, obj);
            });
        });

        req.on('error', function(statusCode,err) {
            console.log(err);
        });

        if(self.options.method=="PUT" || self.options.method=="POST") 
        {
            req.write(JSON.stringify(lightSwitchObj));
        }

        req.end();
}

module.exports = ServiceController;