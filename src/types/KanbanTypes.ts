export interface ColumnProps {
	title: string
	children: React.ReactNode
	status: keyof KanbanState
	taskCount: number
}

export interface CardType {
	id: string
	title: string
	description?: string
	status?: string
	createdAt?: string
	isCreatingMode?: boolean
}

export interface KanbanState {
	todo: CardType[]
	inProgress: CardType[]
	needReview: CardType[]
	done: CardType[]
}

export interface Task {
	id: string
	tenantID: string
	taskDescription: string
	taskStatus: string
	taskTitle: string
	created_at: string
	updated_at: string
}

export interface CardProps {
	key: string
	card: CardType
	index: number
	status: keyof KanbanState
	isHighlighted: boolean
}

export type CreateData = Pick<
	Task,
	'taskDescription' | 'taskStatus' | 'taskTitle'
>
