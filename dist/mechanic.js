/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.Harvester');
 * mod.thing == 'a thing'; // true
 */

module.exports.mechanic = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 300, body: [WORK, WORK, CARRY, MOVE] },
            { minEnergy: 350, body: [WORK, WORK, CARRY, MOVE, MOVE], v: "2.0" },
            { minEnergy: 450, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE], v: "3.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "mechanic")
    },
    run: function(creep) {
        var mod = require('role.Base');
        mod.base.dieingTask(creep);
        if(creep.spawning) {
            creep.memory.task = "mine";
        }
        else {
            if(creep.memory.task === "mine") {
                mod.base.mineTask(creep, "repair");
            } 
            if(creep.memory.task === "repair") {
                var structures = creep.room.find(FIND_STRUCTURES, { filter: function(structure) { return structure.structureType === STRUCTURE_ROAD && structure.percentHealth() < .8; } });
                // console.log(JSON.stringify(structures));
                if(structures.length > 0)
                {
                    var result = creep.repair(structures[0]);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(structures[0]);
                    } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
                        creep.memory.task = "mine";
                    } else if (result == ERR_INVALID_TARGET) {
                        creep.memory.task = "fillSpawn";
                    }
                } else {
                    mod.base.assembleTask(creep);
                }
            }
            if(creep.memory.task === "fillSpawn") {
                mod.base.storeEnergyTask(creep);
            }
        }
    }
}
