import { Dispatch, SetStateAction } from 'react'

export interface ColumnProps {
	title: string
	task: string
	setNewTask: Dispatch<SetStateAction<string>>
	isAdding: Record<string, boolean>
	setIsAdding: Dispatch<SetStateAction<Record<string, boolean>>>
	children: React.ReactNode
	onDrop: (
		card: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => void
	status: keyof KanbanState
	onAddTask: () => void
	taskCount: number
	setKanbanState: Dispatch<SetStateAction<any>>
	handleCreateTask: (data: any) => void
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
	card: CardType
	index: number
	moveCard: (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		newIndex: number,
		newStatus: keyof KanbanState
	) => void
	task: string
	setNewTask: Dispatch<SetStateAction<string>>
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
