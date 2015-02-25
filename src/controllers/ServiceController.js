var https = require('https');
var http = require('http');

function ServiceController(){

}

ServiceController.prototype.GetWeather = function(callback){
var url = 'http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&units=imperial';
    http.get(url, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var data = JSON.parse(body)
            var weatherObj = {};
            weatherObj.Weather = data.weather[0].main;
            weatherObj.Temp = data.main.temp.toFixed(0) + "°F";
            return callback(weatherObj);
        });
    }).on('error', function(e) {
          console.log("Got error: ", e);
    });
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

ServiceController.prototype.SetLightState = function(lightSwitchObj){
 this.options = {
        host: 'huetube.info',
        path: '/groups/0',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
    };

    var req = http.request(this.options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });
    });

    req.on('error', function(statusCode,err) {
        console.log(err);
    });

    if(this.options.method=="PUT" || this.options.method=="POST") 
    {
        req.write(JSON.stringify(lightSwitchObj));
    }

    req.end();
}

module.exports = ServiceController;