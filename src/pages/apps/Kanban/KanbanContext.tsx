import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
} from 'react'
import useTask from './useTask'
import Swal from 'sweetalert2'
import { CardType, ColumnType, KanbanState } from '@/types/KanbanTypes'
import { useParams } from 'react-router-dom'
import { formatStringDisplayName } from '@/utils/formatString'
import { v4 as uuidv4 } from 'uuid'

interface KanbanContextType {
	boardId: string
	newTaskTitle: string
	setNewTaskTitle: Dispatch<SetStateAction<string>>
	addTaskToSection: (section: string, columnId: string) => Promise<void>
	removeTask: () => Promise<void>
	highlightTask: (taskId: any) => void
	kanbanState: KanbanState
	highlightedTaskId: string | null
	selectedTask: any
	setSelectedTask: Dispatch<SetStateAction<CardType | null>>
	setKanbanState: Dispatch<SetStateAction<KanbanState>>
	setHighlightedTaskId: Dispatch<SetStateAction<string | null>>
	handleStatusChange: (status: string, columnID: string) => void
	updateTaskById: (taskId: string, data: any) => void
	editTask: string
	setEditTask: Dispatch<SetStateAction<string>>
	updateTask: () => Promise<void>
	moveCard: (
		fromColumnId: string,
		toColumnId: string,
		cardd: CardType,
		index?: number
	) => void
	handleAddList: () => Promise<void>
	editableRef: any
	taskCardDimensions: {
		width: number
		height: number
		top: number
		left: number
		bottom: number
		right: number
	} | null
	setTaskCardDimensions: Dispatch<
		SetStateAction<{
			width: number
			height: number
			top: number
			left: number
			bottom: number
			right: number
		} | null>
	>
	openColumnStatus: string | null
	setOpenColumnStatus: Dispatch<SetStateAction<string | null>>
	createTask: (data: any) => void
	columnFormState: {
		columnName: string
		isFormVisible: boolean
	}
	setColumnFormState: Dispatch<
		SetStateAction<{
			columnName: string
			isFormVisible: boolean
		}>
	>
	modalState: {
		viewTask: boolean
		moveTask: boolean
		copyTask: boolean
	}
	toggleModal: (
		modalName: 'viewTask' | 'moveTask' | 'copyTask',
		isVisible: boolean
	) => void
	getTaskColumns: () => Promise<any>
}

interface ModalState {
	viewTask: boolean
	moveTask: boolean
	copyTask: boolean
}

interface ColumnFormState {
	columnName: string
	isFormVisible: boolean
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const editableRef = useRef<HTMLAnchorElement | null>(null)
	const { boardId } = useParams() as { boardId: string }
	const {
		tasks,
		createTask,
		deleteTaskById,
		updateTaskStatus,
		updateTaskById,
		createTaskColumn,
		getTaskColumns,
	} = useTask(boardId)

	const [kanbanState, setKanbanState] = useState<KanbanState>({ columns: [] })
	const [newTaskTitle, setNewTaskTitle] = useState<string>('')
	const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
		null
	)
	const [selectedTask, setSelectedTask] = useState<CardType | null>(null)
	const [modalState, setModalState] = useState<ModalState>({
		viewTask: false,
		moveTask: false,
		copyTask: false,
	})
	const [editTask, setEditTask] = useState('')
	const [columnFormState, setColumnFormState] = useState<ColumnFormState>({
		columnName: '',
		isFormVisible: false,
	})
	const [taskCardDimensions, setTaskCardDimensions] = useState<{
		width: number
		height: number
		top: number
		left: number
		bottom: number
		right: number
	} | null>(null)
	const [openColumnStatus, setOpenColumnStatus] = useState<string | null>(null)

	const handleAddList = async () => {
		if (columnFormState.columnName.trim() === '') {
			return
		}
		await createTaskColumn({
			id: uuidv4(),
			name: columnFormState.columnName,
		})
		fetchColumns()
		setColumnFormState((prevState) => ({ ...prevState, columnName: '' }))
	}

	// const formatTasks = (tasks: Task[]): any => {
	// 	return tasks.reduce((acc: KanbanState, task: Task) => {
	// 		const formattedTask: CardType = {
	// 			id: task.id,
	// 			title: task?.taskTitle,
	// 			status: formatStringDisplayName(task?.taskStatus),
	// 			description: task?.taskDescription,
	// 			createdAt: task?.created_at,
	// 		}

	// 		const kanbanKey = task.taskStatus as keyof KanbanState

	// 		if (!acc[kanbanKey]) {
	// 			acc[kanbanKey] = []
	// 		}

	// 		acc[kanbanKey].push(formattedTask)
	// 		return acc
	// 	}, {})
	// }

	const fetchColumns = async () => {
		const columns = await getTaskColumns()

		setKanbanState((prevState) => {
			const existingColumnsMap = prevState.columns?.reduce(
				(acc, column) => {
					acc[column.id] = column
					return acc
				},
				{} as Record<string, ColumnType>
			)

			const updatedColumns = columns.map((column) => {
				return {
					id: column.id,
					name: column.name,
					cards: existingColumnsMap[column.id]?.cards || [],
				}
			})

			return {
				...prevState,
				columns: updatedColumns,
			}
		})
	}

	useEffect(() => {
		const initializeKanbanState = async () => {
			const columns = await getTaskColumns()

			const initialState = columns.reduce(
				(acc, column) => {
					acc.columns.push({
						id: column.id,
						name: column.name,
						cards: tasks
							? tasks
									.filter((task) => task.columnId === column.id)
									.map((task) => ({
										id: task?.id,
										boardId: task?.board_id,
										title: task?.taskTitle,
										status: formatStringDisplayName(task?.taskStatus),
										description: task?.taskDescription,
										taskHistory: task?.taskHistory,
										createdAt: task?.created_at,
									}))
							: [],
						...(column.order && { order: column.order }),
					})
					return acc
				},
				{ columns: [] } as KanbanState
			)

			setKanbanState(initialState)
		}

		initializeKanbanState()
	}, [tasks])

	const moveCard = async (
		fromColumnId: string,
		toColumnId: string,
		cardd: CardType,
		index?: number
	) => {
		const fromColumn = kanbanState.columns.find(
			(column) => column.id === fromColumnId
		)
		const toColumn = kanbanState.columns.find(
			(column) => column.id === toColumnId
		)

		const newColumns = [...kanbanState.columns]
		newColumns.forEach((col) => {
			if (col.id === fromColumnId) {
				col.cards = col.cards.filter((card) => card.id !== cardd.id)
			}
			if (col.id === toColumnId) {
				const newCards = [...col.cards]
				const targetIndex = index !== undefined ? index : newCards.length;
				newCards.splice(targetIndex, 0, cardd)
				col.cards = newCards
			}
		})

		setKanbanState({ columns: newColumns })

		try {
			await updateTaskStatus(cardd.id, {
				taskStatus: toColumn?.name,
				columnId: toColumnId,
			})
		} catch (error) {
			console.error('Failed to update task status:', error)
		}
	}

	const addTaskToSection = async (section: string, columnId: string) => {
		const newTask: any = {
			columnId,
			taskStatus: section,
			taskTitle: newTaskTitle,
		}
		await createTask(newTask)
		setNewTaskTitle('')
	}

	const updateTask = async () => {
		if (editTask.trim() === '') return
		await updateTaskStatus(highlightedTaskId as string, { taskTitle: editTask })
		setEditTask('')
		setHighlightedTaskId('')
		setSelectedTask(null)
	}

	const removeTask = async () => {
		const confirmDelete = await Swal.fire({
			title: 'Are you sure?',
			text: 'This action is irreversible!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		})

		if (confirmDelete.isConfirmed) {
			await deleteTaskById(selectedTask?.id)
			setEditTask('')
			setHighlightedTaskId(null)
			setSelectedTask(null)
			Swal.fire({
				title: 'Deleted!',
				text: 'Your task has been deleted.',
				icon: 'success',
				showConfirmButton: false,
				timer: 2000,
			})
		}
	}

	const highlightTask = (task: any) => {
		setHighlightedTaskId(task.id)
		setEditTask(task.title)
		setSelectedTask(task)
	}

	const toggleModal = (
		modalName: keyof typeof modalState,
		isVisible: boolean
	) => {
		setModalState((prevState) => ({ ...prevState, [modalName]: isVisible }))
	}

	const onCopyTask = () => {
		setShowCopyModal(true)
	}

	const handleStatusChange = async (status: string, columnID: string) => {
		console.log("status ", status)
		await updateTaskStatus(selectedTask.id, { columnId: columnID, taskStatus: status })
		setHighlightedTaskId(null)
		setEditTask('')
		setSelectedTask(null)
		// setKanbanState((prevState) => formatTasks([...tasks]))
	}

	return (
		<KanbanContext.Provider
			value={{
				boardId,
				newTaskTitle,
				setNewTaskTitle,
				addTaskToSection,
				removeTask,
				highlightTask,
				kanbanState,
				highlightedTaskId,
				selectedTask,
				setSelectedTask,
				setKanbanState,
				setHighlightedTaskId,
				handleStatusChange,
				editTask,
				setEditTask,
				updateTask,
				moveCard,
				updateTaskById,
				handleAddList,
				editableRef,
				taskCardDimensions,
				setTaskCardDimensions,
				openColumnStatus,
				setOpenColumnStatus,
				createTask,
				columnFormState,
				setColumnFormState,
				modalState,
				toggleModal,
				getTaskColumns,
			}}>
			{children}
		</KanbanContext.Provider>
	)
}

export const useKanbanContext = () => {
	const context = useContext(KanbanContext)
	if (!context) {
		throw new Error('useMyContext must be used within a MyProvider')
	}
	return context
}
