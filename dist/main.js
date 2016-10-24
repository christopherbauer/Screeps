Structure.prototype.percentHealth = function() {
    return this.hits/this.hitsMax;
}
RoomPosition.prototype.distanceTo = function(pos) {
    return Math.sqrt(Math.pow(this.x - pos.x,2) + Math.pow(this.y - pos.y,2));
}
RoomPosition.prototype.getCoordFromOrigin = function(otherPos) {
    return { x: this.x - otherPos.x, y: this.y - otherPos.y };
}
RoomPosition.prototype.isFree = function() {
    var contents = this.look();
    
    var blockingTypes = [ "creep", "structure" ];
    var blockingSubTypes = { type: "terrain", terrain: "wall" };
    
    for(var content in contents) {
        if(blockingTypes.indexOf(contents[content].type) > -1){
            return false;
        }
        if(JSON.stringify(blockingSubTypes).indexOf(JSON.stringify(contents[content])) > -1) {
            return false;
        }
    }
    return true;
}
Creep.prototype.canHarvest = function(source) {
    return this.harvest(source) === ERR_NOT_IN_RANGE;
}
Creep.prototype.nearestFloorEnergy = function() {
    var energy = this.pos.findInRange(FIND_DROPPED_ENERGY,2);
    if(energy.length == 0){
        return;
    }
    return energy[0];
}
Creep.prototype.nearestSource = function(filter) {
    var sources;
    if(filter) {
        sources = this.room.find(FIND_SOURCES, filter); 
    } else {
        sources = this.room.find(FIND_SOURCES);
    }
    var nearestUnusedSource;
    for(var source in sources){
        if(this.pos.isNearTo(sources[source])) { //if you're already there, keep harvesting
            return sources[source].id;
        }
        
        if(nearestUnusedSource == null){
            nearestUnusedSource = sources[source].id;   
        } else if(nearestUnusedSource != null) {
            var curDistanceTo = this.pos.distanceTo(sources[source].pos); //distance to new source
            var oldDistanceTo = this.pos.distanceTo(Game.getObjectById(nearestUnusedSource).pos);
            
            if(curDistanceTo < oldDistanceTo) {
                nearestUnusedSource = sources[source].id;
            }
        }
    }
    return nearestUnusedSource;
}
Creep.prototype.nearestUnusedSource = function(filter) {
    var sources;
    if(filter) {
        sources = this.room.find(FIND_SOURCES, filter); 
    } else {
        sources = this.room.find(FIND_SOURCES);
    }
    var nearestUnusedSource;
    for(var source in sources){
        if(this.pos.isNearTo(sources[source])) { //if you're already there, keep harvesting
            return sources[source].id;
        }
        if(!sources[source].isFree()){ //if not free, skip it
            continue;
        }
        
        if(nearestUnusedSource == null){
            nearestUnusedSource = sources[source].id;   
        } else if(nearestUnusedSource != null) {
            var curDistanceTo = this.pos.distanceTo(sources[source].pos); //distance to new source
            var oldDistanceTo = this.pos.distanceTo(Game.getObjectById(nearestUnusedSource).pos);
            
            if(curDistanceTo < oldDistanceTo) {
                nearestUnusedSource = sources[source].id;
            }
        }
    }
    return nearestUnusedSource;
}
Room.prototype.isFree = function(pos) {
    var contents = this.lookAt(pos);
    var blockingTypes = [ "creep" ];
    var blockingSubTypes = { type: "terrain", terrain: "wall" };
    
    for(var content in contents) {
        if(blockingTypes.indexOf(contents[content].type) > -1){
            return false;
        }
        if(JSON.stringify(blockingSubTypes).indexOf(JSON.stringify(contents[content])) > -1) {
            return false;
        }
    }
    return true;
}

Source.prototype.isFree = function() {
    var pos = this.pos;
    return this.room.isFree(new RoomPosition(pos.x-1, pos.y-1, this.room.name)) || //nw
        this.room.isFree(new RoomPosition(pos.x, pos.y-1, this.room.name)) || //n
        this.room.isFree(new RoomPosition(pos.x+1, pos.y-1, this.room.name)) || //ne
        this.room.isFree(new RoomPosition(pos.x-1, pos.y, this.room.name)) || //w
        this.room.isFree(new RoomPosition(pos.x+1, pos.y, this.room.name)) || //e
        this.room.isFree(new RoomPosition(pos.x-1, pos.y+1, this.room.name)) || //sw
        this.room.isFree(new RoomPosition(pos.x, pos.y+1, this.room.name)) || //s
        this.room.isFree(new RoomPosition(pos.x+1, pos.y+1, this.room.name)); //se
}
module.exports.loop = function () {
    var harvester = require('role.Harvester');
    var upgrader = require('role.Upgrader');
    var assembler = require('role.Assembler');
    var mechanic = require('role.Mechanic');
    var conqueror = require('role.Conqueror');
    var staticMiner = require('role.StaticMiner');
    var _ = require('lodash');
    for(var room_id in Game.rooms) {
        var curRoom = Game.rooms[room_id];
        var controllerLevel;
        if(curRoom.controller != null && curRoom.controller.my) {
            controllerLevel = curRoom.controller.level;
            var options = [
                { controllerLevel: 1, extensions: 0 },
                { controllerLevel: 2, extensions: 2 },
                { controllerLevel: 3, extensions: 5 },
                { controllerLevel: 4, extensions: 9 }
            ];
            var extensionMin;
            for(var option in options){
                if(controllerLevel === options[option].controllerLevel) {
                    extensionMin = options[option].extensions;
                }
            }
            var extensions = curRoom.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_EXTENSION; } });
            var plannedExtensions = curRoom.find(FIND_MY_CONSTRUCTION_SITES, { filter: function(site) { return site.structureType === STRUCTURE_EXTENSION; } });
            if((extensions.length + plannedExtensions.length) < extensionMin) {
                var spawns = curRoom.find(FIND_MY_SPAWNS);
                var location = spawns[0].pos;
                var newLocation = new RoomPosition(location.x -1, location.y - 1, curRoom.name);
                var checkCount = 0;
                var skipSpace = 1;
                while(!newLocation.isFree()) {
                    if(checkCount !== 0 && checkCount % 4 === 0) {
                        skipSpace++;
                    }
                    if(checkCount % 4 === 0) {
                        newLocation = new RoomPosition(location.x + (skipSpace * -1), location.y + (skipSpace * -1), curRoom.name);
                    }
                    else if(checkCount % 4 === 1) {
                        newLocation = new RoomPosition(location.x + skipSpace, location.y + (skipSpace * -1), curRoom.name);
                    }
                    else if(checkCount % 4 === 2) {
                        newLocation = new RoomPosition(location.x + skipSpace, location.y + skipSpace, curRoom.name);
                    }
                    else if(checkCount % 4 === 3) {
                        newLocation = new RoomPosition(location.x + (skipSpace * -1), location.y + skipSpace, curRoom.name);
                    }
                    checkCount++;
                    //check the corners by usign isfree and some kind of rotation using the spawn as 0,0
                }
                curRoom.createConstructionSite(newLocation.x, newLocation.y, STRUCTURE_EXTENSION);
            }
            
            // if(extensions.length >= 8 && _.filter(curRoom.find(FIND_MY_CREEPS), function(creep) { return creep.name.startsWith("conqueror"); }).length === 0) {
            //     var exits = Game.map.describeExits(curRoom.name);
            //     for(var exit in exits) {
            //         var nextRoom = Game.rooms[exits[exit]];
            //         console.log(JSON.stringify(nextRoom));
            //         if(nextRoom.isFree()) {
            //             if(nextRoom.controller !== undefined && nextRoom.find(FIND_SOURCES).length > 0 && curRoom.energyAvailable >= 650) {
            //                 conqueror.spawn(aRoom);
            //             }
            //         }
            //     }
            // }
        }
    }
    var options = {
        population: [
            { role: "assembler", priority: 100, minimum: 2, spawner: assembler, isEnabled: function (room) { return room.find(FIND_MY_CONSTRUCTION_SITES).length > 0; } },
            { role: "mechanic", priority: 99, minimum: 1, spawner: mechanic, isEnabled: function(room) { return room.find(FIND_STRUCTURES, { filter: function(structure) { return structure.percentHealth() < .8; } }).length > 0; } },
            { role: "upgrader", priority: 98, minimum: 9, spawner: upgrader, isEnabled: function() { return true; } },
            { role: "staticminer", priority: 2, minimum: 2, spawner: staticMiner, isEnabled: function(room) { return room.find(FIND_SOURCES, { filter: function(source) { return source.pos.findInRange(FIND_MY_CREEPS, 1, { filter: function(creep) { return creep.name.startsWith("staticminer"); } }).length === 0; } }).length > 0; }, canSkip: false },
            { role: "harvester", priority: 1, minimum: 4, spawner: harvester, isEnabled: function() { return true; }, canSkip: false }
        ]
    };
    options.population = options.population.sort(function(a,b) { return a.priority - b.priority; });
    for(var room_id in Game.rooms) {
        var aRoom = Game.rooms[room_id];
        for(var configId in options.population) {
            var demographic = options.population[configId];
            // if(demographic.spawner == null) {
            //     throw 
            // }
            var expectedNumber = demographic.minimum;
            var currentNumber = _.filter(aRoom.find(FIND_MY_CREEPS), function(creep) { return creep.name.toUpperCase().startsWith(demographic.role.toUpperCase()); }).length;
            if(currentNumber < expectedNumber) {
                if(demographic.isEnabled(aRoom)) {
                    var result = demographic.spawner[demographic.role].spawn(aRoom);
                    if(result == ERR_NOT_ENOUGH_ENERGY || !demographic.canSkip) {
                        break;
                    }
                } else {
                    continue;
                }
            }
        }
    }
    for(var creep in Game.creeps) {
        var creep = Game.creeps[creep];
        var creepName = creep.name.toLowerCase();
        // harvester.harvester.run(creep);
        if(creepName.startsWith("harvester")) {
            harvester.harvester.run(creep);
        } else if(creepName.startsWith("upgrader")){
            upgrader.upgrader.run(creep);
        } else if(creepName.startsWith("assembler")) {
            assembler.assembler.run(creep);
        } else if(creepName.startsWith("mechanic")) {
            mechanic.mechanic.run(creep);
        } else if(creepName.startsWith("conqueror")) {
            conqueror.conqueror.run(creep);
        } else if(creepName.startsWith("staticminer")) {
            staticMiner.staticminer.run(creep);
        }
    }
}
