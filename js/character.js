'use strict';

/*
 *	Character (Base Class)
 */
var Character = function(cname, hpmax, mpmax, baseattr, dmgmin, dmgmax, crit, critm, ac, evade, attack) {
	// Primary stats
	this.name = cname;
	this.hpmax = hpmax;
	this.hp = this.hpmax;
	this.mpmax = mpmax;
	this.mp = this.mpmax;
	this.dmgmin = dmgmin;
	this.dmgmax = dmgmax;
	
	this.attributes = [
		{ name: 'Strength', base: baseattr[0], buff: 0, spent: 0,
			description : 'Strength is the physical power of your character. It is the requirement'
			 	+ 'to wield mightier weapons. Every 5 strength increase your meele minimal damage by '
				+ '1 and maximal damage by 2.' },
		{ name: 'Endurance', base: baseattr[1], buff: 0, spent: 0,
			description : 'Endurance helps you to stay in battle longer. It is the key requirement'
				+ 'for any sort of armor. Every 5 endurance grant you 1 more maximal health point on'
				+ 'level up.' },
		{ name: 'Agility', base: baseattr[2], buff: 0, spent: 0,
			description : 'Agility measures your speed and dexterity. It is the key requirement'
				+ 'for bows. More agility gives a higher chance for evades. Every 10 agility incrase'
				+ 'the minimal damage of bows by 1 and maximal damage by 2. [not implemented yet]' },
		{ name: 'Intelligence', base: baseattr[3], buff: 0, spent: 0,
			description : 'Intelligence helps you to outwit your foe. It is the key requirement'
				+ 'for wands and jewelery. Every 5 Intelligence increase the minimal damage of wands'
				+ 'by 1 and the maximal damage by 2. [not implemented yet]' },
		{ name: 'Wisdom', base: baseattr[4], buff: 0, spent: 0,
			description : 'Wisdom is the knowledge you gathered about the world. It is a secondary'
				+ 'requirement for many equipment pieces. It increases your defensive spells. [not implemented yet]' }
	];
	
	// Secondary stats
	this.crit = crit;
	this.critm = critm;
	this.ac = ac;
	this.evade = evade;
	this.attack = attack;
}

Character.prototype.doDmg = function() {
	var tmpCrit = false;
	var tmpDmg = 0;
	
	if (Math.random() <= this.crit) {
		tmpCrit = true;
		tmpDmg = this.dmgmax * this.critm;
	} else {
		tmpDmg = Math.floor(randInt(this.dmgmin, this.dmgmax+1) + (this.attributes[0].base + this.attributes[0].buff - 20) / 5);
	}
	
	return {
		dmgdone: tmpDmg,
		attack: this.attack,
		isCrit: tmpCrit
	}
}

Character.prototype.takeDmg = function(dmg, attack) {
	var died = false;
	var tmpEvade = false;
	var tmpDmg = 0;
	var tmpHitprob= attack/(attack * 0.75 + this.evade * 1.25);
	
	if (Math.random() <= tmpHitprob) {
		tmpDmg = dmg - this.ac;
		if (tmpDmg < 0) {
			tmpDmg = 0;
		}
		this.hp -= tmpDmg;
		if (this.hp <= 0) {
			died = true;
			this.hp = this.hpmax;
		}
	} else {
		tmpEvade = true;
		tmpDmg = 0;
	}
	
	return {
		dmgtaken: tmpDmg,
		isEvaded: tmpEvade,
		isDead: died
	}
}


/*
 *	Player
 * 	The player character, inherits from character
 */
var Player = function(cname, hpmax, mpmax, baseattr, dmgmin, dmgmax) {
	Character.call(this, cname, hpmax, mpmax, baseattr, dmgmin, dmgmax, 0, 1, 0, 100, 1000);
	
	this.level = 1;
	this.xp = 0;
	this.xpup = Math.pow(this.level, 2) + 20;
	this.unspentAP = 0;
	this.gold = 0;
	
	this.equipment = [
		{ type:'Weapon', item:null },
		{ type:'Shield', item:null },
		{ type:'Helm', item:null },
		{ type:'Armor', item:null },
		{ type:'Pants', item:null },
		{ type:'Shoes', item:null },
		{ type:'Ring', item:null },
		{ type:'Necklace', item:null }
	];
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.levelUp = function() {
	this.level++;
	this.xpup = Math.pow(this.level, 2) + 20;
	this.unspentAP += 5;
	
	var tmphpbonus = 7 + Math.floor(this.attributes[1].base / 20);
	var tmphpgain = randInt(tmphpbonus-1, tmphpbonus+2);
	this.hpmax += tmphpgain;
	this.hp += tmphpgain;
	
}

Player.prototype.gainXp = function(exp) {
	this.xp += exp;
	while (this.xp >= this.xpup) {
		this.xp -= this.xpup;
		this.levelUp();
	}
	return exp;
}

Player.prototype.gainGold = function(gold) {
	this.gold += gold
	return gold;
}

Player.prototype.spendAp = function(attr) {
	if (this.unspentAP > 0) {
		this.unspentAP--;
		attr.spent++;
	}
}

Player.prototype.unspendAp = function(attr) {
	if (attr.spent > 0) {
		this.unspentAP++;
		attr.spent--;
	}			
}

Player.prototype.applyAp = function() {
	for (var i = 0; i < this.attributes.length; i++) {
		this.attributes[i].base += this.attributes[i].spent;
		this.attributes[i].spent = 0;
	}
}

Player.prototype.equip = function(item) {
	for (var i = 0; i < this.equipment.length; i++) {
		if (this.equipment[i].type == item.type) {
			// Unequip previous item
			var oldItem = this.equipment[i].item;
			if (oldItem) {
				if (oldItem.dmgmin) {
					this.dmgmin -= oldItem.dmgmin;
					this.dmgmax -= oldItem.dmgmax;	
				}
				if (oldItem.armor) {
					this.ac -= oldItem.armor;
				}
				this.changebuff(oldItem, false);
			}

			// Equip new item
			this.equipment[i].item = item;
			if (item.dmgmin) {
				this.dmgmin += item.dmgmin;
				this.dmgmax += item.dmgmax;
			}
			if (item.armor) {
				this.ac += item.armor;
			}
			this.changebuff(item, true);
		
			console.log(this.equipment);
			return oldItem;
		}
	}
}

Player.prototype.changebuff = function(item, add) {
	var factor = -1;
	if (add) {
		factor = 1;
	}
	
	for (var j = 0; j < item.buff.length; j++) {
		if (item.buff[j].name == 'HP') {
			this.hpmax += factor * item.buff[j].value;
		} else if (item.buff[j].name == 'Strength') {
			this.attributes[0].buff += factor * item.buff[j].value;
		} else if (item.buff[j].name == 'Endurance') {
			this.attributes[1].buff += factor * item.buff[j].value;
		} else if (item.buff[j].name == 'Agility') {
			this.attributes[2].buff += factor * item.buff[j].value;
		} else if (item.buff[j].name == 'Intelligence') {
			this.attributes[3].buff += factor * item.buff[j].value;
		} else if (item.buff[j].name == 'Wisdom') {
			this.attributes[4].buff += factor * item.buff[j].value;
		}
	}
} 



/*
 *	Monster
 * 	A monster, inherits from Character
 */
var Monster = function(cname, hpmax, mpmax, baseattr, dmgmin, dmgmax, prefix, suffix, xp, gold) {
	Character.call(this, cname, hpmax, mpmax, baseattr, dmgmin, dmgmax, 0, 1, 0, 100, 1000);
	
	this.prefix = prefix;
	this.suffix = suffix;
	
	this.xp = xp;
	this.gold = gold;
}

Monster.prototype = Object.create(Character.prototype);
Monster.prototype.constructor = Monster;


/*
 * Global utility functions
 * randInt(minVal, maxVal) - creates a random integer between minVal (included)
 * 	and maxVal (excluded) --> [minVal, maxVal[
 */
function randInt(minVal, maxVal) {
	return Math.floor(Math.random() * (maxVal - minVal) + minVal);
}