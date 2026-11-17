// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { OffsetPagination, type OffsetPaginationParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * Define tasks that agents work toward and link the browsers they use.
 */
export class Tasks extends APIResource {
  /**
   * Define a task before or while an agent works on it, optionally linking the
   * browsers it uses. Submit reports against the returned task ID.
   *
   * @example
   * ```ts
   * const task = await client.tasks.create({
   *   description: 'Book a hotel room for two nights',
   * });
   * ```
   */
  create(body: TaskCreateParams, options?: RequestOptions): APIPromise<Task> {
    return this._client.post('/tasks', { body, ...options });
  }

  /**
   * Retrieve a task and the IDs of its linked browsers.
   *
   * @example
   * ```ts
   * const task = await client.tasks.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Task> {
    return this._client.get(path`/tasks/${id}`, options);
  }

  /**
   * List tasks in the request's project, newest first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const task of client.tasks.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: TaskListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<TasksOffsetPagination, Task> {
    return this._client.getAPIList('/tasks', OffsetPagination<Task>, { query, ...options });
  }

  /**
   * Link browsers to an existing task. Linking a browser that is already linked has
   * no effect, so the call is safe to retry. Returns the updated task.
   *
   * @example
   * ```ts
   * const task = await client.tasks.linkBrowsers('id', {
   *   session_ids: ['x'],
   * });
   * ```
   */
  linkBrowsers(id: string, body: TaskLinkBrowsersParams, options?: RequestOptions): APIPromise<Task> {
    return this._client.post(path`/tasks/${id}/browsers`, { body, ...options });
  }
}

export type TasksOffsetPagination = OffsetPagination<Task>;

/**
 * A goal an agent works toward. Reports are submitted against a task, and browsers
 * can be linked to it. Tasks are immutable apart from added browser links.
 */
export interface Task {
  /**
   * Unique identifier for the task
   */
  id: string;

  /**
   * When the task was created
   */
  created_at: string;

  /**
   * What the task is meant to accomplish
   */
  description: string;

  /**
   * Caller-defined string key-value pairs for grouping and filtering tasks, such as
   * a user or thread ID. At most 20 keys; keys are 1-64 characters, values at most
   * 256 characters, and keys and values together at most 4 KB.
   */
  metadata: TaskMetadata;

  /**
   * IDs of browsers linked to the task, oldest link first. Linked browsers may since
   * have been deleted.
   */
  session_ids: Array<string>;

  /**
   * When work on the task started
   */
  started_at: string;

  /**
   * Hostname of the website the task targets
   */
  target_website?: string | null;
}

/**
 * Caller-defined string key-value pairs for grouping and filtering tasks, such as
 * a user or thread ID. At most 20 keys; keys are 1-64 characters, values at most
 * 256 characters, and keys and values together at most 4 KB.
 */
export type TaskMetadata = { [key: string]: string };

export interface TaskCreateParams {
  /**
   * What the task is meant to accomplish, at most 4 KB.
   */
  description: string;

  /**
   * Caller-defined string key-value pairs for grouping and filtering tasks, such as
   * a user or thread ID. At most 20 keys; keys are 1-64 characters, values at most
   * 256 characters, and keys and values together at most 4 KB.
   */
  metadata?: TaskMetadata;

  /**
   * IDs of browsers to link to the task. Each must belong to the request's project;
   * deleted browsers can be linked.
   */
  session_ids?: Array<string>;

  /**
   * When work on the task started. Defaults to the time the task is created. Must be
   * no more than 5 minutes in the future or 30 days in the past.
   */
  started_at?: string;

  /**
   * Hostname of the website the task targets, without a scheme or path.
   */
  target_website?: string;
}

export interface TaskListParams extends OffsetPaginationParams {
  /**
   * Only return tasks linked to this browser ID.
   */
  session_id?: string;
}

export interface TaskLinkBrowsersParams {
  /**
   * IDs of browsers to link. Each must belong to the task's project; deleted
   * browsers can be linked. Browsers already linked are ignored. A task can have at
   * most 100 linked browsers.
   */
  session_ids: Array<string>;
}

export declare namespace Tasks {
  export {
    type Task as Task,
    type TaskMetadata as TaskMetadata,
    type TasksOffsetPagination as TasksOffsetPagination,
    type TaskCreateParams as TaskCreateParams,
    type TaskListParams as TaskListParams,
    type TaskLinkBrowsersParams as TaskLinkBrowsersParams,
  };
}
