define(["thirdParty/three.min"], function() {
    var TerrainRenderer = function() {
        
    };
    
    TerrainRenderer.prototype = {
        SetScene: function(scene) {
            var mesh = this.mesh;
            if (this.meshes && this.scene) {
                this.SetMesh(undefined);
            }
            
            this.scene = scene;
            if (this.camera) {
                scene.add(this.camera);
            }
            
            if (mesh) {
                this.SetMesh(mesh);
            }
        },
        
        SetRenderer: function(renderer) {
            this.renderer = renderer;
        },
        
        SetCamera: function(camera) {
            this.camera = camera;
            if (this.scene) {
                this.scene.add(camera);
            }
        },
        
        SetMesh: function(mesh) {
            if (this.mesh && this.scene) {
                this.scene.remove(this.mesh);
            }
            
            this.mesh = mesh;
            
            if (this.scene && this.mesh) {
                this.scene.add(this.mesh);
            }
        },
        
        Update: function() {
            if (this.renderer && this.scene && this.camera && this.mesh)
                this.renderer.render(this.scene, this.camera);
        }
    };
    
    return new TerrainRenderer();
})