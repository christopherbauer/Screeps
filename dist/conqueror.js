/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.Conqueror');
 * mod.thing == 'a thing'; // true
 */

module.exports.conqueror = {
    spawn: function(room) {
        var mod = require('role.Base');
        bodyConfig = [ 
            { minEnergy: 650, body: [ MOVE, CLAIM ], v: "1.0" }
        ];
        return mod.base.spawn(room, bodyConfig, "conqueror");
    },
    run: function(creep) {
        var mod = require('role.Base');
        mod.base.dieingTask(creep);
        var exits = Game.map.describeExits(curRoom);
        for(var exit in exits) {
            var nextRoom = exits[exit];
            if(nextRoom.isFree()) {
                if(nextRoom.controller !== undefined && nextRoom.find(FIND_SOURCES).length > 0) {
                    creep.moveTo(nextRoom.controller.pos);
                }
            }
        }
    }
};
