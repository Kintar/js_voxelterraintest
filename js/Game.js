define([
        "ComponentManager",
        "thirdParty/Stats",
        "thirdParty/three.min"
    ],
    function(ComponentManager, Stats, three) {
        var Game = {
            Run: false,
            Running: false,
            Initialized: false,
            
            Init: function() {
                if (this.Initialized) {
                    console.warn("Attempted to call Game.Init() more than once");
                    return;
                }
                
                ComponentManager.LoadComponent("UI", this.InitUI);
                ComponentManager.LoadComponent("TerrainGenerator", function(c) {
                    c.Regenerate(256, 256, 256);
                });
                
                this.InitStats();
                
                this.clock = new three.Clock();
            },
            
            InitUI: function(ui) {
                Game.UI = ui;
                ui.Register(Game, "Start", {folder: "Game Control"});
            },
    
            Start: function() {
                if (this.Running) {
                    return;
                }
    
                this.Running = true;
                this.clock.start();
                this.GameLoop();
                Game.UI.Remove(Game, "Start", "Game Control");
                Game.UI.Register(Game, "Stop", {folder: "Game Control"});
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
    
            GameLoop: function() {
                if (Game.Running) {
                    window.requestAnimationFrame(Game.GameLoop);
                    
                    Game.stats.update();
                    ComponentManager.Update(Game.clock.getDelta());
                }
            },

            Stop: function() {
                if (!this.Running) return;
                
                this.Running = false;
                this.clock.stop();
                
                Game.UI.Remove(Game, "Stop", "Game Control");
                Game.UI.Register(Game, "Start", {folder: "Game Control"});
            },
            
            ToggleRunning: function() {
                if (this.Running)
                    this.Stop();
                else 
                    this.Start();
            }
        };
    
        return Game;
    }
);