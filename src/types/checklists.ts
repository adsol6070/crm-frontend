export type ChecklistsData = {
    id: string;
    tenantID: string;
    visaType: string;
    checklists: string;
}

export type ChecklistItem = {
    name: string;
    required: boolean;
}