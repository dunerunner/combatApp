/* global angular: true */

'use strict';
var s;

angular.module('combatControllers', [])
        .controller('combatController', ['$scope',
            function ($scope) {
                s = $scope;
                var roundCounter = 0;
                var roundMessage = '';
                function Fighter(name, ad, hp, dph) {
                    this.name = name;
                    this.ad = parseInt(ad);
                    this.maxHp = parseInt(hp);
                    this.currentHp = parseInt(hp);
                    this.dph = parseInt(dph);
                    this.dice1 = 0;
                    this.dice2 = 0;
                    this.attack = 0;
                }
                function LogMessage(msg) {
                    this.name = 'Round ' + roundCounter + ': ';
                    this.msg = msg;
                }
                $scope.enemiesCount = 1;
                $scope.cloneNumber = 0;
                $scope.selectedTarget = 0;
                $scope.fightLog = [];
                $scope.showStats = true;
                $scope.killedEnemies = 0;
                $scope.fighterData = [
                    {ad: 0, hp: 0, dph: 2},
                    {ad: 0, hp: 0, dph: 2},
                    {ad: 0, hp: 0, dph: 2},
                    {ad: 0, hp: 0, dph: 2}
                ];
                var player;
                var clone;
                $scope.currentFighter;
                $scope.enemies = [];
                $scope.generateFighters = function () {
                    player = new Fighter('Player', $scope.fighterData[0].ad, $scope.fighterData[0].hp, $scope.fighterData[0].dph);
                    $scope.cloneNumber = parseInt($scope.cloneNumber);
                    if ($scope.cloneNumber > 0) {
                        clone = new Fighter('Clone of Troll ' + $scope.cloneNumber, $scope.fighterData[$scope.cloneNumber].ad, $scope.fighterData[$scope.cloneNumber].hp, $scope.fighterData[$scope.cloneNumber].dph);
                        $scope.currentFighter = clone;
                    } else {
                        $scope.currentFighter = player;
                    }
                    for (var i = 1; i < $scope.fighterData.length; i++) {
                        if ($scope.fighterData[i].ad) {
                            $scope.enemies.push(new Fighter('Troll ' + i, $scope.fighterData[i].ad, $scope.fighterData[i].hp, $scope.fighterData[i].dph));
                        }
                    }
                    $scope.showStats = false;
                };
                function attack(attacker, target) {
                    target.currentHp -= attacker.dph;
                    roundMessage = roundMessage + attacker.name + ' has hit ' + target.name + ' for <span class="combat-log-hp">' + attacker.dph + 'HP</span>! ';
                    if (target.currentHp <= 0) {
                        target.currentHp = 0;
                        roundMessage = roundMessage + target.name + ' <span class="combat-log-hp">was killed by</span> ' + attacker.name + '! ';
                        if ($scope.currentFighter.currentHp > 0) {
                            $scope.killedEnemies++;
                        }
                    }
                }
                function calculateAttacks() {
                    if ($scope.currentFighter.dice1 === 1 && $scope.currentFighter.dice2 === 1) {
                        roundMessage = roundMessage + '<span class="combat-log-critfail"> Critical failure! </span>';
                        $scope.enemies.forEach(function (element) {
                            if (element.currentHp > 0 && $scope.currentFighter.currentHp > 0) {
                                attack(element, $scope.currentFighter);
                            }
                        });
                    } else
                    if ($scope.currentFighter.dice1 === 6 && $scope.currentFighter.dice2 === 6) {
                        roundMessage = roundMessage + '<span class="combat-log-crit"> Critical strike! </span>';
                        attack($scope.currentFighter, $scope.enemies[parseInt($scope.selectedTarget)]);
                    } else {
                        $scope.currentFighter.attack = $scope.currentFighter.ad + $scope.currentFighter.dice1 + $scope.currentFighter.dice2;
                        $scope.enemies.forEach(function (element, index) {
                            element.attack = element.ad + element.dice1 + element.dice2;
                            if (element.attack > $scope.currentFighter.attack) {
                                if (element.currentHp > 0 && $scope.currentFighter.currentHp > 0) {
                                    attack(element, $scope.currentFighter);
                                }
                            } else if (element.attack < $scope.currentFighter.attack) {
                                if (parseInt($scope.selectedTarget) === index) {
                                    attack($scope.currentFighter, element);
                                }
                            } else {
                                if (element.currentHp > 0) {
                                    roundMessage = roundMessage + "It's a tie between " + element.name + ' and ' + $scope.currentFighter.name + '! ';
                                }
                            }
                        });
                    }
                }
                $scope.rollDice = function () {
                    roundMessage = '';
                    if ($scope.killedEnemies === $scope.enemies.length) {
                        alert('A winrar is you!');
                        return;
                    }
                    if ($scope.enemies[parseInt($scope.selectedTarget)].currentHp === 0) {
                        alert('Select another target!');
                        return;
                    }
                    if ($scope.currentFighter.currentHp === 0) {
                        if (clone) {
                            $scope.currentFighter = player;
                            roundMessage = 'Player starts fight!';
                            var message = new LogMessage(roundMessage);
                            $scope.fightLog.push(message);
                            return;
                        } else {
                            alert('You are dead!');
                            return;
                        }
                    }
                    roundCounter++;
                    $scope.currentFighter.dice1 = Math.floor(6 * Math.random()) + 1;
                    $scope.currentFighter.dice2 = Math.floor(6 * Math.random()) + 1;
                    $scope.enemies.forEach(function (element) {
                        element.dice1 = Math.floor(6 * Math.random()) + 1;
                        element.dice2 = Math.floor(6 * Math.random()) + 1;
                    });
                    calculateAttacks();
                    var message = new LogMessage(roundMessage);
                    $scope.fightLog.push(message);
                };
            }]);
        