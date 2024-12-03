export interface ColumnProps {
	id: string
	columnId: string
	title: string
	children: React.ReactNode
	status: string
	taskCount: number
	isFormVisible: boolean
}

export interface CardType {
	id: string | undefined
	title: string
	description?: string
	taskHistory?: any[]
	status?: string
	createdAt?: string
	isCreatingMode?: boolean
	columnId?: string
}

export interface ColumnType {
	id: string
	name: string
	order?: number
	cards: CardType[]
}

export interface KanbanState {
	columns: ColumnType[]
}

export interface Task {
	id: string
	tenantID: string
	taskDescription: string
	taskStatus: string
	taskHistory: string
	taskTitle: string
	created_at: string
	updated_at: string
}

export interface CardProps {
	card: CardType
	index: number
	status: string
	columnId: string
}

export type CreateData = Pick<
	Task,
	'taskDescription' | 'taskStatus' | 'taskTitle'
>
