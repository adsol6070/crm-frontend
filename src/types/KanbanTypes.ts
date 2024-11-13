export interface ColumnProps {
	title: string
	children: React.ReactNode
	onDrop: (
		card: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => void
	status: keyof KanbanState
	onAddTask: () => void
	taskCount: number
}

export interface CardType {
	id: string
	title: string
	description?: string
	status?: string
	createdAt?: string
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
	card: CardType
	index: number
	moveCard: (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		newIndex: number,
		newStatus: keyof KanbanState
	) => void
	status: keyof KanbanState
	onViewTask: () => void
	onDeleteTask: () => void
	onEdit: () => void
	isHighlighted: boolean
}

export type CreateData = Pick<
	Task,
	'taskDescription' | 'taskStatus' | 'taskTitle'
>
