'use strict';

/*
 * Controllers
 *
 * [1] rpgController is the core of the application. It runs the main combat routine
 *	as interval every second.
 */
rpgApp.controller('rpgController', ['$scope', '$interval', 'PlayerFactory', 'MonsterFactory', 
									'Items', 'Combatlog', 'localStorageService',
	function ($scope, $interval, PlayerFactory, MonsterFactory, Items, Combatlog, localStorageService) {
	
	// Controller and scope initialization
	$scope.stage = 1;
	
	// Init: Load the Combatlog into the scope
	$scope.combatlog = Combatlog;
	
	// Init: Items
	$scope.item = Items;
	/*var backpack = localStorageService.get('rpgApp.backpack');
	if (backpack) {
		$scope.item.list = backpack;
	}*/

	// Init: Player character
	var loadedChar = localStorageService.get('rpgApp.character');
	if (loadedChar) {
		$scope.character = PlayerFactory.load(loadedChar);
	} else {
		$scope.character = PlayerFactory.new();
	} 
	//	$scope.character = PlayerFactory.new();
	
	var retObj = localStorageService.get('character');
	console.log('retrievedObject: ', retObj);
	console.log('attributes', retObj.attributes[0].base);
	//console.log('parsedObject: ', JSON.parse(retObj));
	
	// Init: Monster
	$scope.monster = MonsterFactory.new($scope.stage);
	$scope.combatlog.addEncounter($scope.monster);
	
	
	// Interval - Combat routine
	var combat = $interval(function() {
		// Attack monster
		var atkresult = $scope.character.doDmg();
		var cmbtresult = $scope.monster.takeDmg(atkresult.dmgdone, atkresult.attack);
		$scope.combatlog.addAttack(cmbtresult.dmgtaken, $scope.monster, true);
		
		if (cmbtresult.isDead) {
			$scope.combatlog.addMonsterDeath($scope.monster);
			
			$scope.monster = MonsterFactory.new($scope.stage);
			$scope.combatlog.addEncounter($scope.monster);
			
			$scope.combatlog.addXpGain($scope.character.gainXp($scope.monster.xp));
			$scope.combatlog.addGoldGain($scope.character.gainGold($scope.monster.gold));
			
			if (Math.random() <= $scope.item.chance) {
				if ($scope.item.list.length <= $scope.item.limit) {
					$scope.combatlog.addItem($scope.item.new($scope.stage));					
				} 
			}

			$scope.character.hp = $scope.character.hpmax;
			
		} else {		
			atkresult = $scope.monster.doDmg();
			cmbtresult = $scope.character.takeDmg(atkresult.dmgdone, atkresult.attack);
			$scope.combatlog.addAttack(cmbtresult.dmgtaken, $scope.monster, false);
			
			if (cmbtresult.isDead) {
				$scope.combatlog.addPlayerDeath();
				$scope.monster = MonsterFactory.new($scope.stage);
				
				$scope.combatlog.addEncounter($scope.monster);
			}
		}	
		
		localStorageService.set('character', $scope.character);
		localStorageService.set('backpack', $scope.item.list);
	}, 1000);

	// View Control functions
	$scope.incStage = function() {
		$scope.stage++;
	};
	
	$scope.decStage = function() {
		if ($scope.stage >= 2) {
			$scope.stage--;			
		}
	};
	
	$scope.isApplyApDisabled = function() {
		for (var i = 0; i < $scope.character.attributes.length; i++) {
			if ($scope.character.attributes[i].spent > 0) {
				return false;
			}
		}		
		return true;
	};
	
	$scope.equip = function(item, index) {
		var oldItem = $scope.character.equip(item);
		$scope.item.list.splice(index, 1);
		if (oldItem) {
			$scope.item.list.push(oldItem);
		}
		
		// If twohanded weapon gets equiped, unequip off-hand
		if (item.twohanded) {
			oldItem = $scope.character.unequip(1);
			if (oldItem) {
				$scope.item.list.push(oldItem);
			}
		}
		
		// If off-hand items gets equiped, unequip two-handed weapons
		if (item.type == 'Shield') {
			if ($scope.character.equipment[0].item.twohanded) {
				oldItem = $scope.character.unequip(0);
				if (oldItem) {
					$scope.item.list.push(oldItem);
				}
			}
		}
	}
	
	$scope.canEquip = function(item) {
		var result = true;
		for (var i = 0; i < item.req.length; i++) {
			if (item.req[i].name == 'Strength') {
				if ($scope.character.attributes[0].base < item.req[i].value) {
					result = false;
				}
			} else if (item.req[i].name == 'Endurance') {
				if ($scope.character.attributes[1].base < item.req[i].value) {
					result = false;
				}
			} else if (item.req[i].name == 'Agility') {
				if ($scope.character.attributes[2].base < item.req[i].value) {
					result = false;
				}
			} else if (item.req[i].name == 'Intelligence') {
				if ($scope.character.attributes[3].base < item.req[i].value) {
					result = false;
				}
			} else if (item.req[i].name == 'Wisdom') {
				if ($scope.character.attributes[4].base < item.req[i].value) {
					result = false;
				}
			}
		}
		return result;
	}
	
	$scope.sell = function(index) {
		$scope.item.list.splice(index, 1);
	}
		
}]);
