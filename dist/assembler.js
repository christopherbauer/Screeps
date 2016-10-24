/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.constructor');
 * mod.thing == 'a thing'; // true
 */

module.exports.assembler = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 300, body: [WORK, WORK, CARRY, MOVE] },
            { minEnergy: 350, body: [WORK, WORK, WORK, CARRY, MOVE], v: "2.0" },
            { minEnergy: 450, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE], v: "3.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "assembler");
    },
    run: function(creep) {
        var mod = require('role.Base');
        mod.base.dieingTask(creep);
        if(creep.spawning) {
            creep.memory.task = "mine";
        }
        else {
            if(creep.memory.task === "mine") {
                mod.base.mineTask(creep, "assemble");
            } else if(creep.memory.task === "assemble") {
                mod.base.assembleTask(creep);
            } else if (creep.memory.task === "fillSpawn"){
                mod.base.storeEnergyTask(creep);
            } else {
                creep.memory.task = "mine";
            }
        }
    }
};
