export default function playState() {
    var fieldSize = 7;
    var orbColors = 6;
    var orbSize = 100;
    //
    var swapSpeed = 200;
    var fallSpeed = 1000;
    var destroySpeed = 500;
    var fastFall = true;
    //
    var gameArray = [];
    var removeMap = [];
    var orbGroup;
    var selectedOrb;
    var canPick = true;
    return {
        create: function () {
            this.drawField();
            canPick = true;
            this.game.input.onDown.add(this.orbSelect);
            this.game.input.onUp.add(this.orbDeselect);
        },
        drawField: function () {
            orbGroup = this.game.add.group();
            for (var i = 0; i < fieldSize; i++) {
                gameArray[i] = [];
                for (var j = 0; j < fieldSize; j++) {
                    var orb = this.game.add.sprite(orbSize * j + orbSize / 2, orbSize * i + orbSize / 2, "orbs");
                    orb.anchor.set(0.5);
                    orbGroup.add(orb);
                    do {
                        var randomColor = this.game.rnd.between(0, orbColors - 1);
                        orb.frame = randomColor;
                        gameArray[i][j] = {
                            orbColor: randomColor,
                            orbSprite: orb
                        }
                    } while (this.isMatch(i, j));
                }
            }
            selectedOrb = null;
        },
        orbSelect: function (e) {
            if (canPick) {
                var row = Math.floor(e.clientY / orbSize);
                var col = Math.floor(e.clientX / orbSize);
                var pickedOrb = this.gemAt(row, col)
                if (pickedOrb != -1) {
                    if (selectedOrb == null) {
                        pickedOrb.orbSprite.scale.setTo(1.2);
                        pickedOrb.orbSprite.bringToTop();
                        selectedOrb = pickedOrb;
                        this.game.input.addMoveCallback(this.orbMove);
                    }
                    else {
                        if (this.areTheSame(pickedOrb, selectedOrb)) {
                            selectedOrb.orbSprite.scale.setTo(1);
                            selectedOrb = null;
                        }
                        else {
                            if (this.areNext(pickedOrb, selectedOrb)) {
                                selectedOrb.orbSprite.scale.setTo(1);
                                this.swapOrbs(selectedOrb, pickedOrb, true);
                            }
                            else {
                                selectedOrb.orbSprite.scale.setTo(1);
                                pickedOrb.orbSprite.scale.setTo(1.2);
                                selectedOrb = pickedOrb;
                                this.game.input.addMoveCallback(this.orbMove);
                            }
                        }
                    }
                }
            }
        },
        orbDeselect: function (e) {
            this.game.input.deleteMoveCallback(this.orbMove);
        },
        orbMove: function (event, pX, pY) {
            if (event.id == 0) {
                var distX = pX - selectedOrb.orbSprite.x;
                var distY = pY - selectedOrb.orbSprite.y;
                var deltaRow = 0;
                var deltaCol = 0;
                if (Math.abs(distX) > orbSize / 2) {
                    if (distX > 0) {
                        deltaCol = 1;
                    }
                    else {
                        deltaCol = -1;
                    }
                }
                else {
                    if (Math.abs(distY) > orbSize / 2) {
                        if (distY > 0) {
                            deltaRow = 1;
                        }
                        else {
                            deltaRow = -1;
                        }
                    }
                }
                if (deltaRow + deltaCol != 0) {
                    var pickedOrb = this.gemAt(this.getOrbRow(selectedOrb) + deltaRow, this.getOrbCol(selectedOrb) + deltaCol);
                    if (pickedOrb != -1) {
                        selectedOrb.orbSprite.scale.setTo(1);
                        this.swapOrbs(selectedOrb, pickedOrb, true);
                        this.game.input.deleteMoveCallback(this.orbMove);
                    }
                }
            }
        },
        swapOrbs: function (orb1, orb2, swapBack) {
            canPick = false;
            var fromColor = orb1.orbColor;
            var fromSprite = orb1.orbSprite;
            var toColor = orb2.orbColor;
            var toSprite = orb2.orbSprite;
            gameArray[this.getOrbRow(orb1)][this.getOrbCol(orb1)].orbColor = toColor;
            gameArray[this.getOrbRow(orb1)][this.getOrbCol(orb1)].orbSprite = toSprite;
            gameArray[this.getOrbRow(orb2)][this.getOrbCol(orb2)].orbColor = fromColor;
            gameArray[this.getOrbRow(orb2)][this.getOrbCol(orb2)].orbSprite = fromSprite;
            var orb1Tween = this.game.add.tween(gameArray[this.getOrbRow(orb1)][this.getOrbCol(orb1)].orbSprite).to({
                x: this.getOrbCol(orb1) * orbSize + orbSize / 2,
                y: this.getOrbRow(orb1) * orbSize + orbSize / 2
            }, swapSpeed, window.Phaser.Easing.Linear.None, true);
            var orb2Tween = this.game.add.tween(gameArray[this.getOrbRow(orb2)][this.getOrbCol(orb2)].orbSprite).to({
                x: this.getOrbCol(orb2) * orbSize + orbSize / 2,
                y: this.getOrbRow(orb2) * orbSize + orbSize / 2
            }, swapSpeed, window.Phaser.Easing.Linear.None, true);
            orb2Tween.onComplete.add(function () {
                if (!this.matchInBoard() && swapBack) {
                    this.swapOrbs(orb1, orb2, false);
                }
                else {
                    if (this.matchInBoard()) {
                        this.handleMatches();
                    }
                    else {
                        canPick = true;
                        selectedOrb = null;
                    }
                }
            });
        },
        areNext: function (orb1, orb2) {
            return Math.abs(this.getOrbRow(orb1) - this.getOrbRow(orb2)) + Math.abs(this.getOrbCol(orb1) - this.getOrbCol(orb2)) == 1;
        },
        areTheSame: function (orb1, orb2) {
            return this.getOrbRow(orb1) == this.getOrbRow(orb2) && this.getOrbCol(orb1) == this.getOrbCol(orb2);
        },
        gemAt: function (row, col) {
            if (row < 0 || row >= fieldSize || col < 0 || col >= fieldSize) {
                return -1;
            }
            return gameArray[row][col];
        },
        getOrbRow: function (orb) {
            return Math.floor(orb.orbSprite.y / orbSize);
        },
        getOrbCol: function (orb) {
            return Math.floor(orb.orbSprite.x / orbSize);
        },
        isHorizontalMatch: function (row, col) {
            return this.gemAt(row, col).orbColor == this.gemAt(row, col - 1).orbColor && this.gemAt(row, col).orbColor == this.gemAt(row, col - 2).orbColor;
        },
        isVerticalMatch: function (row, col) {
            return this.gemAt(row, col).orbColor == this.gemAt(row - 1, col).orbColor && this.gemAt(row, col).orbColor == this.gemAt(row - 2, col).orbColor;
        },
        isMatch: function (row, col) {
            return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
        },
        matchInBoard: function () {
            for (var i = 0; i < fieldSize; i++) {
                for (var j = 0; j < fieldSize; j++) {
                    if (this.isMatch(i, j)) {
                        return true;
                    }
                }
            }
            return false;
        },
        handleMatches: function () {
            removeMap = [];
            for (var i = 0; i < fieldSize; i++) {
                removeMap[i] = [];
                for (var j = 0; j < fieldSize; j++) {
                    removeMap[i].push(0);
                }
            }
            this.handleHorizontalMatches();
            this.handleVerticalMatches();
            this.destroyOrbs();
        },
        handleVerticalMatches: function () {
            for (var i = 0; i < fieldSize; i++) {
                var colorStreak = 1;
                var currentColor = -1;
                var startStreak = 0;
                for (var j = 0; j < fieldSize; j++) {
                    if (this.gemAt(j, i).orbColor == currentColor) {
                        colorStreak++;
                    }
                    if (this.gemAt(j, i).orbColor != currentColor || j == fieldSize - 1) {
                        if (colorStreak >= 3) {
                            console.log("VERTICAL :: Length = " + colorStreak + " :: Start = (" + startStreak + "," + i + ") :: Color = " + currentColor);
                            for (var k = 0; k < colorStreak; k++) {
                                removeMap[startStreak + k][i]++;
                            }
                        }
                        startStreak = j;
                        colorStreak = 1;
                        currentColor = this.gemAt(j, i).orbColor;
                    }
                }
            }
        },
        handleHorizontalMatches: function () {
            for (var i = 0; i < fieldSize; i++) {
                var colorStreak = 1;
                var currentColor = -1;
                var startStreak = 0;
                for (var j = 0; j < fieldSize; j++) {
                    if (this.gemAt(i, j).orbColor == currentColor) {
                        colorStreak++;
                    }
                    if (this.gemAt(i, j).orbColor != currentColor || j == fieldSize - 1) {
                        if (colorStreak >= 3) {
                            console.log("HORIZONTAL :: Length = " + colorStreak + " :: Start = (" + i + "," + startStreak + ") :: Color = " + currentColor);
                            for (var k = 0; k < colorStreak; k++) {
                                removeMap[i][startStreak + k]++;
                            }
                        }
                        startStreak = j;
                        colorStreak = 1;
                        currentColor = this.gemAt(i, j).orbColor;
                    }
                }
            }
        },
        destroyOrbs: function () {
            var destroyed = 0;
            for (var i = 0; i < fieldSize; i++) {
                for (var j = 0; j < fieldSize; j++) {
                    if (removeMap[i][j] > 0) {
                        var destroyTween = this.game.add.tween(gameArray[i][j].orbSprite).to({
                            alpha: 0
                        }, destroySpeed, window.Phaser.Easing.Linear.None, true);
                        destroyed++;
                        destroyTween.onComplete.add(function (orb) {
                            orb.destroy();
                            destroyed--;
                            if (destroyed == 0) {
                                this.makeOrbsFall();
                                if (fastFall) {
                                    this.replenishField();
                                }
                            }
                        });
                        gameArray[i][j] = null;
                    }
                }
            }
        },
        makeOrbsFall: function () {
            var fallen = 0;
            var restart = false;
            for (var i = fieldSize - 2; i >= 0; i--) {
                for (var j = 0; j < fieldSize; j++) {
                    if (gameArray[i][j] != null) {
                        var fallTiles = this.holesBelow(i, j);
                        if (fallTiles > 0) {
                            if (!fastFall && fallTiles > 1) {
                                fallTiles = 1;
                                restart = true;
                            }
                            var orb2Tween = this.game.add.tween(gameArray[i][j].orbSprite).to({
                                y: gameArray[i][j].orbSprite.y + fallTiles * orbSize
                            }, fallSpeed, window.Phaser.Easing.Linear.None, true);
                            fallen++;
                            orb2Tween.onComplete.add(function () {
                                fallen--;
                                if (fallen == 0) {
                                    if (restart) {
                                        this.makeOrbsFall();
                                    }
                                    else {
                                        if (!fastFall) {
                                            this.replenishField();
                                        }
                                    }
                                }
                            })
                            gameArray[i + fallTiles][j] = {
                                orbSprite: gameArray[i][j].orbSprite,
                                orbColor: gameArray[i][j].orbColor
                            }
                            gameArray[i][j] = null;
                        }
                    }
                }
            }
            if (fallen == 0) {
                this.replenishField();
            }
        },
        replenishField: function () {
            var replenished = 0;
            var restart = false;
            for (var j = 0; j < fieldSize; j++) {
                var emptySpots = this.holesInCol(j);
                if (emptySpots > 0) {
                    if (!fastFall && emptySpots > 1) {
                        emptySpots = 1;
                        restart = true;
                    }
                    for (var i = 0; i < emptySpots; i++) {
                        var orb = this.game.add.sprite(orbSize * j + orbSize / 2, - (orbSize * (emptySpots - 1 - i) + orbSize / 2), "orbs");
                        orb.anchor.set(0.5);
                        orbGroup.add(orb);
                        var randomColor = this.game.rnd.between(0, orbColors - 1);
                        orb.frame = randomColor;
                        gameArray[i][j] = {
                            orbColor: randomColor,
                            orbSprite: orb
                        }
                        var orb2Tween = this.game.add.tween(gameArray[i][j].orbSprite).to({
                            y: orbSize * i + orbSize / 2
                        }, fallSpeed, window.Phaser.Easing.Linear.None, true);
                        replenished++;
                        orb2Tween.onComplete.add(function () {
                            replenished--;
                            if (replenished == 0) {
                                if (restart) {
                                    this.makeOrbsFall();
                                }
                                else {
                                    if (this.matchInBoard()) {
                                        this.game.time.events.add(250, this.handleMatches);
                                    }
                                    else {
                                        canPick = true;
                                        selectedOrb = null;
                                    }
                                }
                            }
                        })
                    }
                }
            }
        },
        holesBelow: function (row, col) {
            var result = 0;
            for (var i = row + 1; i < fieldSize; i++) {
                if (gameArray[i][col] == null) {
                    result++;
                }
            }
            return result;
        },
        holesInCol: function(col) {
            var result = 0;
            for (var i = 0; i < fieldSize; i++) {
                if (gameArray[i][col] == null) {
                    result++;
                }
            }
            return result;
        }

    }
}