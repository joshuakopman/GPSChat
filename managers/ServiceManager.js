var https = require('https'),
    http = require('http');

var ServiceManager = function(){
    return{
        getWeather : function(lat,lon,callback){
            var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code&temperature_unit=fahrenheit';
            https.get(url, function(res) {
                var body = '';

                res.on('data', function(chunk) {
                    body += chunk;
                });

                res.on('end', function() {
                    var weatherObj = {};
                    weatherObj.Weather = '';
                    weatherObj.Temp = '';
                    try {
                        var data = JSON.parse(body);
                        var weatherCodeMap = {
                            0: 'Clear',
                            1: 'Mainly Clear',
                            2: 'Partly Cloudy',
                            3: 'Cloudy',
                            45: 'Fog',
                            48: 'Rime Fog',
                            51: 'Light Drizzle',
                            53: 'Drizzle',
                            55: 'Heavy Drizzle',
                            61: 'Light Rain',
                            63: 'Rain',
                            65: 'Heavy Rain',
                            71: 'Light Snow',
                            73: 'Snow',
                            75: 'Heavy Snow',
                            80: 'Rain Showers',
                            81: 'Rain Showers',
                            82: 'Heavy Rain Showers',
                            95: 'Thunderstorm'
                        };

                        if (data && data.current) {
                            var code = data.current.weather_code;
                            weatherObj.Weather = weatherCodeMap.hasOwnProperty(code) ? weatherCodeMap[code] : 'Unknown';
                            weatherObj.Temp = Math.round(data.current.temperature_2m) + "°F";
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                    return callback(weatherObj);
                });
            }).on('error', function(e) {
                  console.log("Got error from weather service: ", e);
                  return callback({ Weather: '', Temp: '' }); 
            });
        },
        getNeighborhoodByCoords : function(lat,lon,callback){
            var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10&lat=' + lat + '&lon=' + lon;
            var requestOptions = {
                headers: {
                    // Nominatim usage policy requires a valid app-identifying user agent.
                    'User-Agent': 'GPSChat/1.0 (legacy-demo)',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            };

            https.get(url, requestOptions, function(res) {
                var body = '';

                res.on('data', function(chunk) {
                    body += chunk;
                });

                res.on('end', function() {
                    try {
                        var data = JSON.parse(body);
                        if (data) {
                            var address = data.address || {};
                            var label = address.neighbourhood ||
                                address.suburb ||
                                address.city_district ||
                                address.city ||
                                address.town ||
                                address.village ||
                                address.county ||
                                address.state;

                            if (label) {
                                return callback(label);
                            }

                            if (data.display_name) {
                                return callback(data.display_name.split(',')[0]);
                            }
                        }
                    } catch (err) {
                        console.log("Neighborhood parse error:", err);
                    }
                    return callback("Local Room " + lat + "," + lon);
                });
            }).on('error', function(e) {
                  console.log("Got error: ", e);
                  return callback("Local Room " + lat + "," + lon);
            });
        },
        checkImageIntegrity : function(url,callback){
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
        },
        setLightState : function(lightSwitchObj){
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
    }
}

module.exports = ServiceManager;
