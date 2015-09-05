'use strict';

/*
 * Combatlog service
 * Creates and maintains logging event for display in the application.
 */
rpgApp.service('Combatlog', function CombatlogService() {
	this.log = [];
	this.limit = 60;
	
	this.addAttack = function(dmg, monster, toMonster) {
		if (toMonster) {
			this.log.unshift(getTimestamp() + ' You cause <span class="DMG">' + dmg + '</span> damage to'
				+ ' <span class="' + monster.prefix + '">' 
				+ monster.name + '</span> ');
		} else {
			this.log.unshift(getTimestamp() + ' <span class="' + monster.prefix + '">' 
				+ monster.name + '</span> causes <span class="DMG">' 
				+ dmg + '</span> to You');		
		}
		this.limitLog();
	}
	
	this.addMonsterDeath = function(monster) {
		this.log.unshift(getTimestamp() + ' <span class="' + monster.prefix + '">' 
			+ monster.name + '</span> ' 
			+ monster.suffix + ' is <span class="DEFEATED">defeated!</span>');	
		this.limitLog();
	}
	
	this.addEncounter = function(monster) {
		this.log.unshift(getTimestamp() + ' You meet' + ' <span class="' + monster.prefix
			+ '">' + monster.name + '</span> '
			+ monster.suffix);	
		this.limitLog();	
	}
	
	this.addPlayerDeath = function() {
		this.log.unshift(getTimestamp() + ' You <span class="DEFEATED">die!</span>');
		this._limitLog();
	}
	
	this.addXpGain = function(xp) {
		this.log.unshift(getTimestamp() + ' You earned <span class="XP">' + xp + '</span> experience!');
		this.limitLog();
	}
	
	this.addGoldGain = function(gold) {
		this.log.unshift(getTimestamp() + ' You earned <span class="GOLD">$' + gold + '</span> gold!');
		this.limitLog();
	}
	
	this.addItem = function(item) {
		this.log.unshift(getTimestamp() + ' You received <span class="' + item.rarity + '">' + item.name + '</span>');
		this.limitLog();
	}
	
	this.limitLog = function() {
		if (this.log.length > this.limit) {
			this.log.pop();
		}
	}

	function getTimestamp() {
		var time = new Date();
		return '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']';		
	}		
});

/*
 * Items Services
 * Used as factory to create new items also maintains the backpack
 */
rpgApp.service('Items', ['ItemConfig', 'RarityConfig', function(ItemConfig, RarityConfig) {
	this.list = [];
	this.limit = 30;
	this.chance = 0.33;
	
	this.new = function(stage) {
		// First: Choose Item type
		var tmpType = randInt(0, ItemConfig.length);
		// Second: Choose item level +- 3 levels around stage
		var tmpLevel = randInt(Math.max(stage-3, 1), stage+4);
		// Third: Load random item template from item type
		var newItem = this._clone(ItemConfig[tmpType].items[randInt(0, ItemConfig[tmpType].items.length)]);
		
		// Fourth: Load Rarity
		var tmpRarity = Math.random();
		var numBuffs = 0;
		var total = 0;
		for (var i = 0; i < RarityConfig.length; i++) {
			if ((RarityConfig[i].prob + total) >= tmpRarity) {
				newItem.rarity = RarityConfig[i].name;
				numBuffs = RarityConfig[i].effect;
				break;
			} else {
				total += RarityConfig[i].prob
			}
		}	
		
		// Add specific properties
		newItem.level = tmpLevel;
		newItem.type = ItemConfig[tmpType].type;
		if (newItem.type == 'Weapon') {
			newItem.dmgmin = tmpLevel * newItem.dmgmin;
			newItem.dmgmax = tmpLevel * newItem.dmgmax;
		} else if (newItem.type == 'Ring' || newItem.type == 'Necklace'){
			numBuffs += 1;
		} else {
			newItem.armor = tmpLevel * newItem.armor;
		}
		
		// Generate buffs
		var tmpBuff = [];	
		for (var i = 0; i < numBuffs; i++) {
			var rndBuff = newItem.buff[randInt(0, newItem.buff.length)]
			var needUpdate = true;

			// Check if this stat is already present
			if (tmpBuff) {
				for (var j = 0; j < tmpBuff.length; j++) {
					if (rndBuff.name == tmpBuff[j].name) {
						needUpdate = false;
						tmpBuff[j].value += rndBuff.value * tmpLevel;
					}
				}
			}
			
			if (needUpdate) {
				rndBuff.value = rndBuff.value * tmpLevel
				tmpBuff.push(rndBuff);
			}
		}
		newItem.buff = tmpBuff;
		
		// Adjust requirements
		for (var i = 0; i < newItem.req.length; i++) {
			newItem.req[i].value = tmpLevel * newItem.req[i].value;
		}
		
		newItem.description = this._generateDescription(newItem);
		
		this.list.push(newItem);
		return newItem;
	}
	
	this._generateDescription = function(item) {
		var description = '';
		
		description = '<span class="' + item.rarity +'">' + item.name + '</span><br/>';
		if (item.twohanded){
			description += '<i>' + item.type + ', Two-Handed</i><br/>';
		} else {
			description += '<i>' + item.type + '</i><br/>';
		}
		description += 'Item level ' + item.level + '<br/>';
		description += '<br/>';
		if (item.dmgmin) {
			description += 'Damage: <span class="DMG">' + item.dmgmin + '-' + item.dmgmax + '</span><br/>';
			description += '<br/>';
		}
		if (item.armor) {
			description += 'Armor: <span class="buff">' + item.armor +'</span><br/>';
			description += '<br/>';	
		}
		if (item.buff.length > 0) {
			description += 'Buffs: <br/>'
			for (var i = 0; i < item.buff.length; i++) {
				description += item.buff[i].name + ': <span class="buff">+' + item.buff[i].value + '</span><br/>';
			}
			description += '<br/>';
		}
		description += 'Requirements: <br/>';
		for (var i = 0; i < item.req.length; i++) {
			description += item.req[i].name + ': <span class="req">' + item.req[i].value + '</span><br/>';
		}
		
		return description;	
	}
	
	this._clone = function (obj) {
	    if(obj == null || typeof(obj) != 'object')
	        return obj;

	    var copy = obj.constructor(); 
		
	    for(var key in obj) {
	        if(obj.hasOwnProperty(key)) {
	            copy[key] = this._clone(obj[key]);
	        }
	    }
        return copy;	
	}
	
}]);


/*
 * MonsterFactory Service
 * Service that provides a factory to create new monsters
 * 
 * Note: Hard coded configurations should be moved to a
 * constant provider in the rpgApp.js
 */
rpgApp.service('MonsterFactory', ['MonsterConfig', function(MonsterConfig) {
	this.new = function(stage) {
		// Initialization
		// Name
		var mname = randInt(0, MonsterConfig.monster.length);
		var prefix = randInt(0, MonsterConfig.prefix.length);
		var suffix = randInt(0, MonsterConfig.suffix.length);

		// HP
		var hpmax = (MonsterConfig.monster[mname].hp + stage / 4) * stage;
		hpmax = Math.floor(hpmax * MonsterConfig.suffix[suffix].hpmod);

		// DMG
		var dmgmin = stage * Math.log(stage) * 6 + 1;
		var dmgmax = dmgmin + stage * Math.log(stage);

		var baseattr = [20, 20, 20, 20, 20];

		// Calculate Combat Power
		var cp = hpmax + dmgmin + dmgmax
		cp = Math.floor(cp * MonsterConfig.prefix[prefix].value);

		var xp = Math.floor(cp/30) +1;
		var gold = Math.floor(cp/10) +1;
	
		return (new Monster(MonsterConfig.monster[mname].name, hpmax, 0, baseattr, dmgmin, dmgmax,
			MonsterConfig.prefix[prefix].name, MonsterConfig.suffix[suffix].name, xp, gold));
	}
}]);

/*
 * PlayerFactory Service
 * Service that provides a factory to create a new player character
 * 
 * Note: Hard coded configurations should be moved to a
 * constant provider in the rpgApp.js
 */
rpgApp.service('PlayerFactory', function () {	
	this.new = function() {	
		// Initialiaze
		var cname = 'Gwindthol';

		var hpmax = 100;
		var mpmax = 50;
	
		var baseattr = [25, 25, 25, 25, 25];

		var dmgmin = 5;
		var dmgmax = 15;
	
		return (new Player(cname, hpmax, mpmax, baseattr, dmgmin, dmgmax));
	}
	
	this.serialize = function(player) {
		var serial = {};
		serial.name = player.name;
		serial.level = player.level
		serial.hpmax = player.hpmax;
		serial.mpmax = player.mpmax;
		
	}
	
	this.load = function(player) {
		var baseattr = [player.attributes[0].base, 
						player.attributes[1].base, 
						player.attributes[2].base, 
						player.attributes[3].base, 
		player.attributes[4].base];
		return (new Player(player.name, player.hpmax, player.mpmax, baseattr, player.dmgmin, player.dmgmax));
	}
});


/*
 * Global utility functions
 * randInt(minVal, maxVal) - creates a random integer between minVal (included)
 * 	and maxVal (excluded) --> [minVal, maxVal[
 */
function randInt(minVal, maxVal) {
	return Math.floor(Math.random() * (maxVal - minVal) + minVal);
}

