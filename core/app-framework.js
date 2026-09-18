"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRegistry = exports.KernelApp = void 0;
class KernelApp {
    constructor(name) {
        this.actions = new Map();
        this.name = name;
        // Register this app in the global registry
        exports.appRegistry.registerApp(this);
    }
    /**
     * Define an action
     */
    action(name, handler) {
        let actionHandler;
        // Create a handler that accepts context and payload, adapting if needed
        if (handler.length === 0) {
            // Handlers with no arguments are not supported
            throw new Error('Action handlers must accept at least the context parameter');
        }
        else if (handler.length === 1) {
            // Handler takes context only
            const contextOnlyHandler = handler;
            actionHandler = async (context, _payload) => contextOnlyHandler(context);
        }
        else {
            // Handler takes both context and payload
            const twoArgHandler = handler;
            actionHandler = twoArgHandler;
        }
        // Register the action
        this.actions.set(name, {
            name,
            handler: actionHandler,
        });
        return actionHandler;
    }
    /**
     * Get all actions for this app
     */
    getActions() {
        return Array.from(this.actions.values());
    }
    /**
     * Get an action by name
     */
    getAction(name) {
        return this.actions.get(name);
    }
    /**
     * Export app information without handlers
     */
    toJSON() {
        return {
            name: this.name,
            actions: this.getActions().map((action) => ({
                name: action.name,
            })),
        };
    }
}
exports.KernelApp = KernelApp;
// Registry for storing all Kernel apps
class KernelAppRegistry {
    constructor() {
        this.apps = new Map();
    }
    registerApp(app) {
        this.apps.set(app.name, app);
    }
    getApps() {
        return Array.from(this.apps.values());
    }
    getAppByName(name) {
        return this.apps.get(name);
    }
    export() {
        return {
            apps: this.getApps().map((app) => app.toJSON()),
        };
    }
    exportJSON() {
        return JSON.stringify(this.export(), null, 2);
    }
}
// Create a singleton registry for apps
exports.appRegistry = new KernelAppRegistry();
//# sourceMappingURL=app-framework.js.map