function Room(name,neighborhood,clients,messages){
    this.Name = name;
    this.Key = name.replace(/[\s\-\.]/g, '').toString();
    this.Neighborhood = neighborhood;
    this.Clients = (clients)?clients:[];
    this.Messages = (messages)?messages:[];
}

module.exports = Room;