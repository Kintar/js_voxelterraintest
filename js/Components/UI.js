define(["thirdParty/dat.gui.min"], function(dat) {
    
    var UI = function() {
        this.ui = new dat.GUI();
        this.autoUpdateControllers = [];
        this.folders = {};
        this.controllerPropertyMappings = {};
    };
    
    UI.prototype = {
        Init: function(game) {
            
        },

        Update: function(delta) {
            for (var i in this.autoUpdateControllers) {
                this.autoUpdateControllers[i].updateDisplay();
            }
        },
        
        AddFolder: function(name) {
            if (!this.folders[name]) {
                var folder = this.ui.addFolder(name);
                this.folders[name] = folder;
            }
        },
        
        RemoveFolder: function(name) {
            if (this.folders[name]) {
                this.folders[name] = null;
                this.ui.removeFolder(name);
            }
        },
        
        Register: function(object, property, options) {
            var controller = null;
            
            var ui = this.ui;
            if (options && options.folder) {
                this.AddFolder(options.folder);
                ui = this.folders[options.folder];
            }
            
            if (options && options.min && options.max) {
                controller = ui.add(object, property, options.min, options.max);
            }
            else {
                controller = ui.add(object, property);
            }
            
            if (options) {
                if (options.onChange) {
                    controller.onChange = options.onChange;
                }
                
                if (options.onFinishChange) {
                    controller.onFinishChange = options.onFinishChange;
                }
                
                if (options.autoUpdate) {
                    this.autoUpdateControllers.push(controller);
                }
            }
            
            if (!this.controllerPropertyMappings[object]) {
                this.controllerPropertyMappings[object] = {};
            }
            
            this.controllerPropertyMappings[object][property] = controller;
        },
        
        Remove: function(object, property, folder) {
            if (this.controllerPropertyMappings[object]) {
                var controller = this.controllerPropertyMappings[object][property];
                
                if (controller) {
                    var ui = this.ui;
                    if (folder && this.folders[folder])
                        ui = this.folders[folder];
                    
                    var index = this.autoUpdateControllers.indexOf(controller);
                    if (index !== -1) {
                        this.autoUpdateControllers.splice(index, 1);
                    }
                    
                    ui.remove(controller);
                }
                
            }
        }
    };

    return new UI();
});