define(["UI", "three.min", "Components", "Stats"], function(UI) {
    var Game = {
        TerrainTesselation: 0,
        TerrainGeneration: 0,
        Running: false,

        Start: function() {
            if (this.Running) return;

            UI.Init(this);
            this.InitStats();
            this.Running = true;
            this.Run();
        },

        InitStats: function() {
            if (this.stats) return;
            
            var stats = new Stats();
            stats.domElement.style.position = "absolute";
            stats.domElement.style.left = "0px";
            stats.domElement.style.bottom = "0px";
            
            document.body.appendChild(stats.domElement);
            
            this.stats = stats;
        },

        Run: function() {
            if (Game.Running) requestAnimationFrame(Game.Run);

            Game.Update();
        },

        Update: function() {
            this.stats.begin();

            UI.Update();
            Game.TerrainTesselation = 0;
            
            this.stats.end();
        },
        
        Stop: function() {
            this.Running = false;
        }
    };
    
    return Game;
});