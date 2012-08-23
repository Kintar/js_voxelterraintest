define(["lib/simplexnoise", "thirdParty/three.min", "Components/UI"], function(noise, three, UI) {
    
    var TerrainGenerator = function() {
        this.noise = new noise();
        this.clock = new three.Clock();
        UI.Register(this, "Generation", {min: 0, max: 100, autoUpdate: true, folder: 'Terrain'});
        UI.Register(this, "Tesselation", {min: 0, max: 100, autoUpdate: true, folder: 'Terrain'});
    };
    
    TerrainGenerator.prototype = {
        Generation: 0,
        Tesselation: 0,
        Generating: false,
        Tesselating: false,
        
        Regenerate: function(width, depth, height) {
            console.log("Requested generation of terrain", width, depth, height);
            
            this.width = width;
            this.height = height;
            this.depth = depth;
            this.targetVoxelCount = width * depth * height;
            this.terrainVoxels = [];
            this.terrainVertices = [];
            this.terrainMesh = null;
            
            this.currentHeight = this.height;
            this.currentWidth = this.width;
            this.currentDepth = this.depth;
            
            this.Generation = 0;
            this.Generating = true;
            this.Tesselating = 0;
        },
        
        Update: function() {
            if (!this.Generating && !this.Tesselating) return;
            
            this.clock.start();

            if (this.Generating)
                this.GenerationStep();
                
            if (this.Tesselating)
                this.TesselationStep();

            this.clock.stop();
        },
        
        GenerationStep: function() {
            // We want to generate at leaast one depth slice per update, and we'll
            // continue to generate more slices as long as it takes us around
            // 1/120th of a second to do so
            var elapsed = 0;
            while (elapsed < 1 / 120) {
                this.currentDepth--;
                if (this.currentDepth < 0) {
                    console.log("Terrain generation complete.  Voxels:", this.terrainVoxels.length)
                    this.Generating = false;
                    this.Generation = 100;
                    this.Tesselating = true;
                    break;
                }
                
                this.currentHeight = this.height;
                while (this.currentHeight > 0) {
                    this.currentHeight--;
                    this.currentWidth = this.width;
                    while (this.currentWidth > 0) {
                        this.currentWidth--;
                        this.terrainVoxels.push(this.noise.noise3d(this.currentWidth, this.currentHeight, this.currentDepth) > 0.4);
                        this.Generation = Math.floor((this.terrainVoxels.length / this.targetVoxelCount) * 100);
                    }
                }

                elapsed += this.clock.getDelta();
            }
        },
        
        TesselationStep: function() {
            
        }
    };
    
    return new TerrainGenerator();
});