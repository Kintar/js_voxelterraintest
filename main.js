require(["jquery", "dat.gui.min", "simplexnoise", "VT", "VT/Terrain", "UI"], function($) {
    $(document).ready(function () {
        UI.Init();
        
        var terrain = new VT.Terrain(64, 64, 64);
        terrain.fillProgress = function (percentage) {
            UI.Progress = Math.Floor(percentage * 100);
        }
        
        terrain.fillRandom(function (percentage) { 
            UI.Progress = Math.Floor(percentage * 100);
        });
        
    });
});