/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.StaticMiner');
 * mod.thing == 'a thing'; // true
 */

module.exports.staticminer = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 650, body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], v: "1.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "staticminer");
    },
    acquireSource: function (creep) {
        var nearestSource = creep.nearestSource({ filter: function(source) { return source.pos.findInRange(FIND_MY_CREEPS, 1, { filter: function(creep) { return creep.name.startsWith("staticminer"); } }).length === 0; } });
        creep.memory.source = nearestSource;
        creep.memory.task = "mine";
    },
    run: function(creep) {
        var mod = require('role.Base');
        
        if(creep.spawning){
            creep.memory.task = "acquireSource";
        } else {
            mod.base.dieingTask(creep);
            if(creep.memory.task === "acquireSource") {
                this.acquireSource(creep);
            }
            if(creep.memory.task === "mine") {
                if(creep.memory.source == null) {
                    this.acquireSource(creep);
                }
                var result = creep.harvest(Game.getObjectById(creep.memory.source));
                if(result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.source));
                }
                if(creep.carry.energy >= creep.carryCapacity) {
                    creep.memory.task = "dropEnergy";
                }
            } 
            if(creep.memory.task === "dropEnergy") {
                creep.drop(RESOURCE_ENERGY);
                creep.memory.task = "mine";
            }
        }
    }
}
