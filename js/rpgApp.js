'use strict';

var rpgApp = angular.module('rpgApp', ['ui.bootstrap', 'ngSanitize', 'LocalStorageModule']);

/*
 * Configuration
 * These are global configuration for monsters and items
 *
 * Some configuration information is still included in 
 * the respective services.
 */
rpgApp.constant('MonsterConfig', {
	monster: [
		{ name: 'Squirrel', hp: 25 },
		{ name: 'Boar', hp: 30 },
		{ name: 'Rat', hp: 20 },
		{ name: 'Goblin', hp: 40 },
		{ name: 'Orc', hp: 50 },
		{ name: 'Skeleton', hp: 35 },
	],
	prefix: [
		{ name: 'WEAKEST', value: 0.8 },
		{ name: 'WEAK', value: 0.9 },
		{ name: 'NORMAL', value: 1 },
		{ name: 'STRONG', value: 1.1 },
		{ name: 'STRONGEST', value: 1.2 }
	],
	suffix: [
		{ name: '', hpmod: 1 },
		{ name: 'the Tank', hpmod: 1.5 },
		{ name: 'the Mad', hpmod: 0.8 },
		{ name: 'the Holy', hpmod: 1.2 },
	]
});

rpgApp.constant('ItemConfig', [
	{ type: 'Weapon', items: [
		{ name: 'Sword', subtype:'Sword', twohanded:false, dmgmin: 4, dmgmax: 5, buff: [ { name:'HP', value: 5 }, { name:'Strength', value: 1 } ], req: [ { name:'Strength', value:5 } ] , icon: 'sword'},
		{ name: 'Bow', subtype:'Bow', twohanded:true, dmgmin: 4, dmgmax: 5, buff: [ { name:'HP', value: 5 }, { name:'Strength', value: 1 }, { name:'Agility', value:1 } ], req: [ { name:'Strength', value:1 }, { name:'Agility', value:5 } ] , icon: 'bow'},
		{ name: 'Staff', subtype:'Staff', twohanded:true, dmgmin: 4, dmgmax: 5, buff: [ { name:'HP', value: 5 }, { name:'Strength', value: 1 }, { name:'Intelligence', value:1 } ], req: [ { name:'Strength', value:1 }, { name:'Intelligence', value:5 } ] , icon: 'staff'},
		{ name: 'Mace', subtype:'Mace', twohanded:false, dmgmin: 4, dmgmax: 5, buff: [ { name:'HP', value: 5 }, { name:'Strength', value: 1 }, { name:'Wisdom', value:1 } ], req: [ { name:'Strength', value:1 }, { name:'Wisdom', value:5 } ] , icon: 'mace'}
	]},
	{ type: 'Shield', items: [
		{ name: 'Wooden Shield', armor: 3, buff: [ { name:'HP', value: 5}, { name:'Wisdom', value: 1 } ], req: [ { name:'Endurance', value:10 } ], icon: 'shield' }
	]},
	{ type: 'Helm', items: [
		{ name: 'Leather Helmet', armor: 1,  buff: [ { name:'HP', value: 5}, { name:'Intelligenec', value: 1 } ], req: [ { name:'Endurance', value:5 } ], icon: 'helm' }
	]},
	{ type: 'Armor', items: [
		{ name: 'Leather Armor', armor: 4, buff: [ { name:'HP', value: 5}, { name:'Strength', value: 1 } ], req: [ { name:'Endurance', value:5 } ], icon: 'armor' }
	]},
	{ type: 'Pants', items: [
		{ name: 'Leather Pants', armor: 2, buff: [ { name:'HP', value: 5} ], req: [ { name:'Endurance', value:5 } ], icon: 'pants' }
	]},
	{ type: 'Shoes', items: [
		{ name: 'Leather Shoes', armor: 1, buff: [ { name:'HP', value: 5}, { name:'Agility', value:1 } ], req: [ { name:'Endurance', value:5 } ], icon: 'shoes' }
	]},
	{ type: 'Ring', items: [
		{ name: 'Iron Ring', buff: [ { name:'HP', value: 5}, { name:'Strength', value: 1 }, { name:'Agility', value:1 }, { name:'Intelligence', value:1 }, { name:'Wisdom', value:1 } ], req: [ { name:'Intelligence', value:5 } ], icon: 'ring' }
	]},
	{ type: 'Necklace', items: [
		{ name: 'Magic Pendant', buff: [ { name:'HP', value: 5}, { name:'Strength', value: 1 }, { name:'Agility', value:1 }, { name:'Intelligence', value:1 }, { name:'Wisdom', value:1 } ], req: [ { name:'Wisdom', value:5 } ], icon: 'necklace' }
	]}	
]);

rpgApp.value('RarityConfig', [
	{ name: 'Legendary', prob: 0.005, effect:3 },
	{ name: 'Rare', prob: 0.045, effect:2 },
	{ name: 'Uncommon', prob: 0.25, effect:1 },
	{ name: 'Common', prob: 0.7, effect:0 }
]);

rpgApp.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('rpgApp');
});