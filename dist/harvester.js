/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.Harvester');
 * mod.thing == 'a thing'; // true
 */

module.exports.harvester = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 300, body: [WORK, WORK, CARRY, MOVE], maxControllerLevel: 2 },
            { minEnergy: 400, body: [WORK, WORK, WORK, CARRY, MOVE], maxControllerLevel: 4, v: "2.0" },
            { minEnergy: 450, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE], maxControllerLevel: 5, v: "3.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "harvester");
    },
    run: function(creep) {
        var mod = require('role.Base');
        
        if(creep.spawning){
            creep.memory.task = "mine";
        } else {
            mod.base.dieingTask(creep);
            if(creep.memory.task === "mine") {
                mod.base.mineTask(creep, "storeEnergy");
            } 
            if(creep.memory.task === "storeEnergy") {
                mod.base.storeEnergyTask(creep);
            }
            if(creep.memory.task === "assemble"){
                mod.base.assembleTask(creep);
            }
            if(creep.memory.task == null) {
                creep.memory.task = "fillSpawn";
            }
        }
    }
}
