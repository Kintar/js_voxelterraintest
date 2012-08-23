define(function () {
        var ComponentManager = function() {
        }
        
        ComponentManager.prototype = {
            PendingComponents: 0,
            Components: {},
            
            LoadComponent: function(name, callback) {
                if (this.Components[name]) {
                    console.warn("Attempted to load component", name, "more than once.");
                    return;
                }
                var cm = this;
                this.PendingComponents++;
                require(["Components/" + name], function(component) {
                    cm.Components[name] = component;

                    if (callback) {
                        try {
                            callback(component);
                        }
                        catch (err) {
                            console.error("Failed to invoke callback for component", name, err);
                            cm.Components[name] = undefined;
                            return;
                        }
                    }
                    console.log("Added component", name, "to ComponentManager");
                });
            },
            
            RemoveComponent: function(name) {
                this.Components[name] = null;
                console.log("Removed component", name);
            },
            
            Update: function(delta) {
                for (var name in this.Components) {
                    var c = this.Components[name];
                    if (c && c.Update) {
                        c.Update(delta);
                    }
                }
            }
        };
        
        return new ComponentManager();
    }
);