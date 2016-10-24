/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.Upgrader');
 * mod.thing == 'a thing'; // true
 */

module.exports.upgrader = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 300, body: [WORK, WORK, CARRY, MOVE], maxControllerLevel: 2 },
            { minEnergy: 350, body: [WORK, WORK, WORK, CARRY, MOVE], maxControllerLevel: 3, v: "2.0" },
            { minEnergy: 500, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], v: "3.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "upgrader");
    },
    run: function(creep) {
        var mod = require('role.Base');
        if(creep.spawning){
            creep.memory.task = "mine";
        }
        else {
            mod.base.dieingTask(creep);
            if(creep.memory.task === "mine") {
                mod.base.mineTask(creep, "upgrade");
            }
            else if(creep.memory.task === "upgrade") {
                var roomController = creep.room.controller;
                var result = creep.upgradeController(roomController);
                if(result == ERR_NOT_IN_RANGE){
                    creep.moveTo(roomController);
                } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.task = "mine";
                }
            } else {
                creep.memory.task = "mine";
            }
        }
    }
};
