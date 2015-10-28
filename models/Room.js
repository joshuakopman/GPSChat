var Room = function(name,neighborhood,clients,radius){
	return{
	    Name : name,
	    Key : name.replace(/[\s\-\.]/g, '').toString(),
	    Neighborhood : neighborhood,
	    Clients : (clients)?clients:[],
	    Messages : [],
	    Radius : (radius) ? radius : 0.9
	}
}

module.exports = Room;