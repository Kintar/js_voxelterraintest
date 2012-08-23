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
                ComponentManager.LoadComponent("TerrainRenderer", function() {
                    Game.InitRenderer();
                });
                ComponentManager.LoadComponent("TerrainGenerator", function(c) {
                    c.SetRenderer(ComponentManager.Components.TerrainRenderer);
                });
                
                this.InitStats();
                
                this.clock = new three.Clock();
            },
            
            InitUI: function(ui) {
                Game.UI = ui;
                ui.Register(Game, "Start", {folder: "Game Control"});
            },
            
            
            InitRenderer: function() {
                this.renderer = this.Detector.webgl ? 
                    new three.WebGLRenderer({
                        antialias: true,
                        clearColor: 0xeeeeee
                    }) :
                    new three.CanvasRenderer();
                
                this.renderer.setClearColorHex(0xBBBBBB, 1);
                this.renderer.setSize( window.innerWidth, window.innerHeight );
                $('#glcontent').append(this.renderer.domElement);
    
                this.scene = new three.Scene();
                this.camera = new three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
                this.camera.position.set(200, 200, 200);
                this.camera.lookAt(new three.Vector3(0,0,0));
                
                this.scene.add(this.camera);
                
                var ambient = new three.AmbientLight(0xffffff);
                var directional = new three.DirectionalLight(0xffffff);
                directional.position.set(new three.Vector3(-1, -1, -1)).normalize();
                this.scene.add(ambient);
                this.scene.add(directional);
                
                var renderComponent = ComponentManager.Components.TerrainRenderer;
                if (renderComponent) {
                    renderComponent.SetScene(this.scene);
                    renderComponent.SetCamera(this.camera);
                    renderComponent.SetRenderer(this.renderer);
                }
            },
    
            Start: function() {
                if (this.Running) {
                    return;
                }
    
                this.Running = true;
                this.clock.start();
                this.GameLoop();
                ComponentManager.Components.TerrainGenerator.Regenerate(128);
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
            },
            
            Detector: {
                canvas: !! window.CanvasRenderingContext2D,
                webgl: (function() {
                    try {
                        return !!window.WebGLRenderingContext && !! document.createElement('canvas').getContext('experimental-webgl');
                    }
                    catch (e) {
                        return false;
                    }
                })(),
                workers: !! window.Worker,
                fileapi: window.File && window.FileReader && window.FileList && window.Blob
            }
        };
    
        return Game;
    }
);