export default function loseState(){
    return{
        create: function(){
            var winLabel = this.game.add.text(80, 80, 'You lose...',
                {font: '50px Arial', fill: '#00FF00'});
            var startLabel = this.game.add.text(80, this.game.world.height -80,
                'press the "W" key to restart',
                {font: '25px Arial', fill: '#fff'});

            var wKey = this.game.input.keyboard.addKey(window.Phaser.Keyboard.W);
            wKey.onDown.addOnce(this.restart, this);
        },
        restart: function(){
            this.game.state.start('menu')
        }
    }
}