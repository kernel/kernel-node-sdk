export interface KernelContext {
    invocation_id: string;
}
export interface KernelAction {
    name: string;
    handler: (context: KernelContext, payload?: any) => Promise<any>;
}
export interface KernelJson {
    apps: KernelAppJson[];
}
export interface KernelAppJson {
    name: string;
    actions: KernelActionJson[];
}
export interface KernelActionJson {
    name: string;
}
export declare class KernelApp {
    name: string;
    actions: Map<string, KernelAction>;
    constructor(name: string);
    /**
     * Define an action
     */
    action<T, R>(name: string, handler: ((context: KernelContext) => Promise<R>) | ((context: KernelContext, payload?: T) => Promise<R>)): (context: KernelContext, payload?: T) => Promise<R>;
    /**
     * Get all actions for this app
     */
    getActions(): KernelAction[];
    /**
     * Get an action by name
     */
    getAction(name: string): KernelAction | undefined;
    /**
     * Export app information without handlers
     */
    toJSON(): KernelAppJson;
}
declare class KernelAppRegistry {
    private apps;
    registerApp(app: KernelApp): void;
    getApps(): KernelApp[];
    getAppByName(name: string): KernelApp | undefined;
    export(): KernelJson;
    exportJSON(): string;
}
export declare const appRegistry: KernelAppRegistry;
export {};
//# sourceMappingURL=app-framework.d.mts.map