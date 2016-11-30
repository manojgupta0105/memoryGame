"use strict";
var module = angular.module("memoryGameApp", [])
.controller('MainController', ['$scope', function($scope) {
  $scope.tilesSrc = ['sci_fi-48.png', 'sheep-48.png', 'fork-48.png']; //,'android-48.png'
  $scope.messageType = null;

  // Listeners for events triggered by angular-memory-game
  $scope.$on("unmatchedPairEvent", function() {
    $scope.message = "Try again!";
    $scope.messageType = 'fail';
  });
  $scope.$on("matchedPairEvent", function() {
    $scope.message = "Good match!";
    $scope.messageType = 'success';
  });
  $scope.$on("completedEvent", function() {
    $scope.message = "Success!";
    $scope.messageType = 'success';
  });

  $scope.restartBtn = function() {
    var newParams = {
      "tilesSrc": ['sci_fi-48.png', 'sheep-48.png', 'fork-48.png'] //,'android-48.png'
    };
    $scope.message = "Restart!";
    $scope.$broadcast("restartEvent", newParams);
  };
}])

.directive("memoryGame", function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      tilesDir: "@",
      tilesSrc: "=",
      tileHeight: "@",
      tileWidth: "@"
    },
    templateUrl: "partials/memory-game.html",
    controller: ['$scope', '$attrs', '$timeout', function($scope, $attrs, $timeout) {

      /**
       * variable to store the current score.
       */
       $scope.numberOfAttempt = 0;

      /**
       * Init the game
       */
      $scope.start = function() {
        // Check coherence between numbers of lines*columns, and numers of provided images
        if ($scope.tilesSrc.length * $attrs.columns === $attrs.lines * $attrs.columns) {
          var deck = makeDeck($scope.tilesSrc);
          $scope.grid = makeGrid(deck);
          $scope.firstPick = $scope.secondPick = undefined;
          $scope.unmatchedPairs = $scope.tilesSrc.length;
        } else {
          console.log("ERROR in memoryGame directive: Bad parameters (check number of lines and row and number image files)");
        }
      }

      // On load, init the game
      $scope.start();

      /**
       * Define Tile object
       * @param {string} title Filename of the picture associated to the tile
       */
      function Tile(title) {
        this.title = title;
        this.flipped = false;
      }

      /**
       * Method flip for Tile
       */
      Tile.prototype.flip = function() {
        this.flipped = !this.flipped;
      };

      /**
       * Function called when player click on a Tile
       * @param {Tile} tile Tile picked by the player
       */
      $scope.flipTile = function(tile) {
        if (tile.flipped) {
          return;
        }
        tile.flip();
        if (!$scope.firstPick) {
          $scope.firstPick = tile;
        } else {
          $scope.numberOfAttempt += 1;
          if ($scope.firstPick.title === tile.title) {
            $scope.unmatchedPairs--;
            $scope.$emit("matchedPairEvent");
            if ($scope.unmatchedPairs == 0) {
              $scope.$emit("completedEvent");
            }
          } else {
            $scope.secondPick = tile;
            $scope.$emit("unmatchedPairEvent");
            var tmpFirstPick = $scope.firstPick;
            var tmpSecondPick = $scope.secondPick;
            $timeout(function() {
              tmpFirstPick.flip();
              tmpSecondPick.flip();
            }, 1000);
          }
          $scope.firstPick = $scope.secondPick = undefined;
        }
      };

      $scope.$on("restartEvent", function(event, args) {
        if (args && args.tilesSrc) {
          $scope.tilesSrc = args.tilesSrc;
          $scope.numberOfAttempt = 0;
        }
        $scope.start();
      });

      /**
       * Create set of tiles
       * @param {array} tileNames Array of filenames
       * @return {array} tileDeck Array of Tiles
       */
      function makeDeck(tileNames) {
        var tileDeck = [];
        for (var i = 0; i < tileNames.length; i++) {
          for (var col = 0; col < $attrs.columns; col++) {
            tileDeck.push(new Tile(tileNames[i]));  
          }
        };
        return tileDeck;
      }


      /**
       * Arrange a set of Tiles on a two-dimensionnal grid
       * @param {array} tileDeck Array of Tiles
       * @return {array} grid Two-dimensional array of Tiles
       */
      function makeGrid(tileDeck) {
        var grid = [];
        for (var row = 0; row < $attrs.lines; row++) {
          grid[row] = [];
          for (var col = 0; col < $attrs.columns; col++) {
              grid[row][col] = removeRandomTile(tileDeck);
          }
        }
        return grid;
      }

      /**
       * Pick a random Tile from a deck to put it on a grid
       * @param {array} tileDeck Array of Tiles
       * @return {tile} Randomly picked Tile
       */
      function removeRandomTile(tileDeck) {
        var i = Math.floor(Math.random()*tileDeck.length);
        return tileDeck.splice(i, 1)[0];
      }

    }]
  };
});
