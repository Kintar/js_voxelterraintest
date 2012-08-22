define(["dat.gui.min"], function() {
    var UI = {
        direction: 1,
        
        Init: function(dataContext) {
            if (!UI.instance) {
                UI.instance = new dat.GUI();
                UI.instance.add(dataContext, "TerrainGeneration", 0, 100);
                UI.instance.add(dataContext, "TerrainTesselation", 0, 100);
                UI.instance.add(dataContext, "Stop");
                this.DataContext = dataContext;
            }
        },

        Update: function() {
            this.DataContext.TerrainGeneration += this.direction;
            if (this.DataContext.TerrainGeneration % 100 === 0)
                this.direction *= -1;

            for (var i in UI.instance.__controllers) {
                UI.instance.__controllers[i].updateDisplay();
            }
        }
    };

    return UI;
});