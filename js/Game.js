define(["UI", "three.min"], function(UI) {
    var Game = {
        TerrainTesselation: 0,
        TerrainGeneration: 0,
        Running: false,

        Start: function() {
            if (this.Running) return;

            UI.Init(this);
            this.Running = true;
            this.Run();
        },

        Run: function() {
            if (Game.Running) requestAnimationFrame(Game.Run);

            UI.Update();
            Game.Update();
        },

        Update: function() {

        }
    };
    
    return Game;
});