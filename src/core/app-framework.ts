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

export class KernelApp {
  name: string;
  actions: Map<string, KernelAction> = new Map();

  constructor(name: string) {
    this.name = name;
    // Register this app in the global registry
    appRegistry.registerApp(this);
  }

  /**
   * Define an action
   */
  action<T, R>(
    name: string,
    handler: ((context: KernelContext) => Promise<R>) | ((context: KernelContext, payload?: T) => Promise<R>),
  ) {
    let actionHandler: (context: KernelContext, payload?: T) => Promise<R>;

    // Create a handler that accepts context and payload, adapting if needed
    if (handler.length === 0) {
      // Handlers with no arguments are not supported
      throw new Error('Action handlers must accept at least the context parameter');
    } else if (handler.length === 1) {
      // Handler takes context only
      const contextOnlyHandler = handler as (context: KernelContext) => Promise<R>;
      actionHandler = async (context: KernelContext, _payload?: T) => contextOnlyHandler(context);
    } else {
      // Handler takes both context and payload
      const twoArgHandler = handler as (context: KernelContext, payload?: T) => Promise<R>;
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
  getActions(): KernelAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get an action by name
   */
  getAction(name: string): KernelAction | undefined {
    return this.actions.get(name);
  }

  /**
   * Export app information without handlers
   */
  toJSON(): KernelAppJson {
    return {
      name: this.name,
      actions: this.getActions().map((action) => ({
        name: action.name,
      })),
    };
  }
}

// Registry for storing all Kernel apps
class KernelAppRegistry {
  private apps: Map<string, KernelApp> = new Map();

  registerApp(app: KernelApp): void {
    this.apps.set(app.name, app);
  }

  getApps(): KernelApp[] {
    return Array.from(this.apps.values());
  }

  getAppByName(name: string): KernelApp | undefined {
    return this.apps.get(name);
  }

  export(): KernelJson {
    return {
      apps: this.getApps().map((app) => app.toJSON()),
    };
  }

  exportJSON(): string {
    return JSON.stringify(this.export(), null, 2);
  }
}

// Create a singleton registry for apps
export const appRegistry = new KernelAppRegistry();
