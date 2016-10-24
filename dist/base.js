/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.Base');
 * mod.thing == 'a thing'; // true
 */

module.exports.base = {
    guid: function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },
    spawn: function(localRoom, bodyConfig, nameBase) {
        var spawn = localRoom.find(FIND_MY_SPAWNS)[0];
        var targetBody;
        var version = "1.0";
        bodyConfig = bodyConfig
            .filter(function(body) { return (body.maxControllerLevel && body.maxControllerLevel >= localRoom.controller.level) || !body.maxControllerLevel; })
            .sort(function(a,b) { return b.minEnergy - a.minEnergy; }); //use sort by descending body configs
        for (var body in bodyConfig)
        {
            if(spawn.room.energyAvailable >= bodyConfig[body].minEnergy) {
                targetBody = bodyConfig[body].body;
                if(bodyConfig[body].v){
                    version = bodyConfig[body].v;
                }
                break;
            }
        }    
        return spawn.createCreep(targetBody, nameBase + "_" + version + "_" + this.guid());
    },
    assembleTask: function(creep) {
        var sources = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        var result = creep.build(sources[0]);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.task = "mine";
        } else if (result == ERR_INVALID_TARGET) {
            creep.memory.task = "fillSpawn";
        }
    },
    dieingTask: function(creep) {
        if(creep.ticksToLive === 1 || creep.memory.task === "suicide") {
            creep.drop(RESOURCE_ENERGY);
            creep.suicide();
        }
    },
    mineTask: function(creep, followingTask) {
        var nearestFloorEnergy = creep.nearestFloorEnergy();
        if(nearestFloorEnergy != null) {
            var result = creep.pickup(nearestFloorEnergy);
            if(result === ERR_NOT_IN_RANGE){
                creep.moveTo(nearestFloorEnergy);
            }
        } else {
            var nearestUnusedSource = creep.nearestUnusedSource();
            var result = creep.harvest(Game.getObjectById(nearestUnusedSource));
            if(result == ERR_NOT_IN_RANGE || result == ERR_NOT_ENOUGH_RESOURCES) {
                creep.moveTo(Game.getObjectById(nearestUnusedSource));
            }
        }
        if(creep.carry.energy >= creep.carryCapacity) {
            creep.memory.task = followingTask;
        }
    },
    
    storeEnergyTask: function(creep) {
		var curRoom = creep.room;
		var spawns = curRoom.find(FIND_MY_SPAWNS, { filter: function(spawn) { return spawn.energy < spawn.energyCapacity } });
		var extensions = curRoom.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity; } });
		var towers = curRoom.find(FIND_MY_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity; } });
		
		if(spawns.length > 0 || extensions.length > 0 || towers.length > 0)
		{
			function closest(creep, a, b) {
			    if(a == null) {
			        return b;
			    } else if (b == null) {
			        return a;
			    }
				if(creep.pos.distanceTo(a.pos) < creep.pos.distanceTo(b.pos)) {
					return a;
				}
				return b;
			}
			
			var curTarget;
			for(var spawn in spawns) {
				curTarget = closest(creep, spawns[spawn], curTarget);
			}
			for(var extension in extensions) {
				curTarget = closest(creep, extensions[extension], curTarget)
			}
			for(var tower in towers) {
				curTarget = closest(creep, extensions[extension], curTarget)
			}
				
			var result = creep.transfer(curTarget, RESOURCE_ENERGY);
			
			if(result == ERR_NOT_IN_RANGE) {
				creep.moveTo(curTarget);
			} else if(result === OK || result === ERR_NOT_ENOUGH_RESOURCES) {
				if(creep.carry.energy == 0) {
					creep.memory.task = "mine";
				}
			} else {
			    creep.memory.task = "mine";
			}
		} else {
			creep.memory.task = "assemble";
		}
	}
};
