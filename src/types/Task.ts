export type Task = {
    id?: string;
    tenantID?: string;
    taskStatus: string;
    taskDescription: string;
    taskTitle: string;
}

export type Board = {
    id?: string;
    tenantID?: string;
    boardTitle: string;
    boardDescription: string;
}

export type TaskColumn = {
    id?: string;
    tenantID?: string;
    name: string;
}

export type TaskComment = {
    id?: string;
    tenantID?: string;
    author_id?: string;
    task_id?: string;
    content: string;
  }