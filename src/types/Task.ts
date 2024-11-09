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
