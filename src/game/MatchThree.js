import bootState from './states/boot';
import loadState from './states/load';
import menuState from './states/menu';
import playState from './states/play';
import endState from './states/end';

window.PIXI = require('phaser-ce/build/custom/pixi');
window.p2 = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

export default function MatchThree() {
    var game = new window.Phaser.Game(700, 700, window.Phaser.AUTO, 'myCanvas')

    game.state.add('boot', bootState);
    game.state.add('load', loadState);
    game.state.add('menu', menuState);
    game.state.add('play', playState);
    game.state.add('end', endState);

    game.state.start('boot');

}