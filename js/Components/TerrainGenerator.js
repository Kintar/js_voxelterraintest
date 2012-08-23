define(["lib/simplexnoise", "thirdParty/three.min", "Components/UI", "Components/TerrainRenderer"], function(noise, three, UI) {
    
    var TerrainGenerator = function() {
        this.noise = new noise();
        this.clock = new three.Clock();
        UI.Register(this, "Generation", {min: 0, max: 100, autoUpdate: true, folder: 'Terrain'});
        UI.Register(this, "Tesselation", {min: 0, max: 100, autoUpdate: true, folder: 'Terrain'});
    };
    
    var FaceDirection = {
        // First three directions modify vertex values in the positive
        UP: 0,
        RIGHT: 1,
        OUT: 2,
        // Next three modify in the negative
        DOWN: 3,
        LEFT: 4,
        IN: 5,
        First: 0,
        Last: 5
    };
    
    TerrainGenerator.prototype = {
        Generation: 0,
        Tesselation: 0,
        Generating: false,
        Tesselating: false,
        TesselatedVoxels: 0,
        TerrainMaterial: new three.MeshLambertMaterial({diffuse: 0x660066}),
        
        SetRenderer: function(terrainRenderer) {
            this.renderer = terrainRenderer;
        },
        
        Regenerate: function(width, depth, height) {
            console.log("Requested generation of terrain", width, depth, height);
            
            this.width = width;
            this.height = height || width;
            this.depth = depth || width;
            this.targetVoxelCount = this.width * this.depth * this.height;
            this.terrainVoxels = [];
            this.terrainVertices = [];
            this.terrainFaces = [];
            this.terrainMesh = undefined;
            
            this.currentHeight = this.height;
            this.currentWidth = this.width;
            this.currentDepth = this.depth;
            
            this.Generation = 0;
            this.Tesselation = 0;
            this.Generating = true;
            this.Tesselating = false;
            this.MeshedVoxels = 0;
            
            this.stride = this.width;
            this.slice = this.width * this.height;
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
                    this.terrainVoxels.reverse();
                    console.log("Terrain generation complete.  Voxels:", this.terrainVoxels.length);
                    this.Generating = false;
                    this.Generation = 100;
                    this.BeginTesseation();
                    break;
                }
                
                this.currentHeight = this.height;
                while (this.currentHeight > 0) {
                    this.currentHeight--;
                    this.currentWidth = this.width;
                    while (this.currentWidth > 0) {
                        this.currentWidth--;
                        if (this.currentDepth == this.depth ||
                            this.currentHeight == this.height || 
                            this.currentWidth == this.width) {
                            this.terrainVoxels.push(false);
                        }
                        else {
                            this.terrainVoxels.push(this.noise.noise3d(this.currentWidth, this.currentHeight, this.currentDepth) > 0.4);                        
                        }
                        this.Generation = Math.floor((this.terrainVoxels.length / this.targetVoxelCount) * 100);
                    }
                }

                elapsed += this.clock.getDelta();
            }
        },
        
        BeginTesseation: function() {
            console.log("Beginning terrain tesselation");
            this.currentDepth = this.depth;
            this.Tesselating = true;
            this.Tesselation = 0;
            this.terrainVertices = [];
            this.terrainFaces = [];
        },
        
        TesselationStep: function() {
            this.clock.start();
            
            var elapsed = 0;
            var voxel = 0;
            while (elapsed < 1 / 120) {
                this.currentDepth--;
                if (this.currentDepth < 0) {
                    console.log("Terrain tesselation complete");
                    this.Tesselating = false;
                    this.Tesselation = 100;
                    
                    var geom = new three.Geometry();
                    geom.vertices = this.terrainVertices;
                    geom.faces = this.terrainFaces;
                    //geom.computeFaceNormals();
                    
                    this.terrainMesh = new three.Mesh(geom, this.TerrainMaterial);
                    this.terrainMesh.position.set(0);
                    
                    if (this.renderer) {
                        this.renderer.SetMesh(this.terrainMesh);
                    }
                    break;
                }
                
                this.currentHeight = this.height;
                while (this.currentHeight > 0) {
                    this.currentHeight--;
                    this.currentWidth = this.width;
                    while (this.currentWidth > 0) {
                        this.currentWidth--;
                        voxel = this.currentDepth * this.currentHeight * this.currentWidth;
                        
                        // Skip filled voxels
                        this.MeshedVoxels++;
                        if (this.terrainVoxels[voxel]) continue;
                        
                        var facing = FaceDirection.Last;
                        while (facing >= FaceDirection.DOWN) {
                            var testVoxel = this.VoxelNumberFrom(voxel, facing);
                            if (this.terrainVoxels[testVoxel]) {
                                this.GenerateFace(voxel, facing);
                            }
                            facing--;
                        }
                    }
                }

                this.Tesselation = Math.floor((this.MeshedVoxels / this.targetVoxelCount) * 100);
                elapsed += this.clock.getDelta();
            }
        },
        
        GenerateFace: function(voxelNumber, facing) {
            // Bottom left inward vertex
            var y = Math.floor(voxelNumber / (this.width * this.depth));
            var z = (voxelNumber % (this.width * this.depth)) % this.height;
            var x = voxelNumber % this.width;
            
            var vertices;
            
            switch (facing) {
                case FaceDirection.UP:
                    vertices = [
                        new three.Vector3(x, y + this.slice, z),
                        new three.Vector3(x, y + this.slice, z + this.stride),
                        new three.Vector3(x + 1, y + this.slice, z + this.stride),
                        new three.Vector3(x + 1, y + this.slice, z)
                    ];
                    break;
                case FaceDirection.DOWN:
                    vertices = [
                        new three.Vector3(x, y, z),
                        new three.Vector3(x + 1, y, z),
                        new three.Vector3(x + 1, y, z + this.stride),
                        new three.Vector3(x + 1, y, z + this.stride)
                    ];
                    break;
            }
            
            if (vertices) {
                for (var v in vertices) {
                    this.terrainVertices.push(vertices[v]);
                }
                
                var vertCount = this.terrainVertices.length - 1;
                this.terrainFaces.push(new three.Face4(vertCount - 3, vertCount - 2, vertCount - 1, vertCount));
            }
        },
        
        VoxelNumberFrom: function(voxelNumber, facing) {
            var vector = facing > 2 ? -1 : 1;
            switch (facing % 3) {
                case 0:
                    voxelNumber *= ((this.width * this.depth) * vector);
                    break;
                case 1:
                    voxelNumber += vector;
                    break;
                case 2:
                    voxelNumber *= (this.width * vector);
                    break;
            }
            return voxelNumber;
        }
        
    };
    
    return new TerrainGenerator();
});