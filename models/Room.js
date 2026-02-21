var Room = function(name,neighborhood,clients,radius,key,level,bucketSize){
	return{
	    Name : name,
	    Key : (key) ? key : name.replace(/[\s\-\.]/g, '').toString(),
	    Neighborhood : neighborhood,
	    Clients : (clients)?clients:[],
	    Messages : [],
	    Radius : (radius) ? radius : 0.9,
	    GranularityLevel : (typeof level === 'number') ? level : 0,
	    BucketSize : bucketSize || 0
	}
}

module.exports = Room;
