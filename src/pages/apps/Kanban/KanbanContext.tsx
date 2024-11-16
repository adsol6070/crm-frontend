// MyContext.tsx
import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
} from 'react'
import useTask from './useTask'
import Swal from 'sweetalert2'
import { CardType, KanbanState } from '@/types/KanbanTypes'
import { useParams } from 'react-router-dom'
import { formatStringDisplayName } from '@/utils/formatString'
import { Task } from '@/types'

interface KanbanContextType {
	newTaskTitle: string // Renamed for clarity
	setNewTaskTitle: Dispatch<SetStateAction<string>>
	createPlaceholderCard: (section: string) => void // Renamed for clarity
	removePlaceholderCard: (section: string) => void
	addTaskToSection: (section: string) => void // Renamed for clarity
	removeTask: (taskId: string) => void // Renamed for clarity
	highlightTask: (taskId: string) => void
	isViewTaskModalVisible: boolean
	setIsViewTaskModalVisible: Dispatch<SetStateAction<boolean>>
	viewTaskModal: (task: any) => void
	kanbanState: any
	isAddCardVisible: Record<string, boolean>
	highlightedTaskId: string | null
	selectedTask: any
	setKanbanState: Dispatch<SetStateAction<KanbanState>>
	setHighlightedTaskId: Dispatch<SetStateAction<string | null>>
	handleStatusChange: (status: string) => void
	editTask: string
	setEditTask: Dispatch<SetStateAction<string>>
	updateTask: () => void
	moveCard: (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		newIndex: number,
		newStatus: keyof KanbanState
	) => Promise<void>
	handleDrop: (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => void
	showMoveModal: boolean
	setShowMoveModal: Dispatch<SetStateAction<boolean>>
}

// Create the context with a default value
const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

// Create a provider component
export const KanbanProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { boardId } = useParams() as { boardId: string }
	const { tasks, createTask, deleteTaskById, updateTaskStatus } =
		useTask(boardId)
	const [kanbanState, setKanbanState] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})
	const [isAddCardVisible, setIsAddCardVisible] = useState<
		Record<string, boolean>
	>({
		todo: false,
		inProgress: false,
		needReview: false,
		done: false,
	})
	const [newTaskTitle, setNewTaskTitle] = useState<string>('')
	const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
		null
	)
	const [isViewTaskModalVisible, setIsViewTaskModalVisible] =
		useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState({})
	const [editTask, setEditTask] = useState('')
	const [showMoveModal, setShowMoveModal] = useState<boolean>(false)

	const formatTask = (task: Task): CardType => ({
		id: task.id,
		title: task?.taskTitle,
		status: formatStringDisplayName(task?.taskStatus),
		description: task?.taskDescription,
		createdAt: task.created_at,
	})

	const formatTasks = (tasks: Task[]): KanbanState => {
		const formattedData: KanbanState = {
			todo: [],
			inProgress: [],
			needReview: [],
			done: [],
		}

		const statusMap: Record<string, string> = {
			to_do: 'todo',
			in_progress: 'inProgress',
			need_review: 'needReview',
			done: 'done',
		}

		tasks.forEach((task: Task) => {
			const formattedTask: CardType = formatTask(task)

			const kanbanKey = statusMap[task.taskStatus] as keyof KanbanState
			formattedData[kanbanKey].push(formattedTask)
		})

		return formattedData
	}

	useEffect(() => {
		setKanbanState(formatTasks(tasks))
	}, [tasks])

	const moveCard = async (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		newIndex: number,
		newStatus: keyof KanbanState
	) => {
		const { id, status: oldStatus, index: oldIndex } = draggedItem

		if (oldStatus === newStatus && oldIndex === newIndex) {
			return
		}

		const updatedOldStatusCards = [...kanbanState[oldStatus]].filter(
			(card) => card.id !== id
		)
		const updatedNewStatusCards =
			oldStatus === newStatus
				? updatedOldStatusCards
				: [...kanbanState[newStatus]]
		updatedNewStatusCards.splice(newIndex, 0, {
			id,
			title: draggedItem.title,
			status: draggedItem.status,
			description: draggedItem.description,
		})

		setKanbanState((prevCards) => ({
			...prevCards,
			[oldStatus]: updatedOldStatusCards,
			[newStatus]: updatedNewStatusCards,
		}))

		const statusMap: Record<string, string> = {
			todo: 'to_do',
			inProgress: 'in_progress',
			needReview: 'need_review',
			done: 'done',
		}

		try {
			await updateTaskStatus(id, { taskStatus: statusMap[newStatus] })
		} catch (error) {
			console.error('Failed to update task status:', error)
		}
	}

	const handleDrop = (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => {
		moveCard(draggedItem, kanbanState[status].length, status)
	}

	// Function to create a placeholder card in a specified section
	const createPlaceholderCard = (section: string) => {
		console.log('Create Placeholder Card get called.')
		const placeholderCard = {
			isCreatingMode: true,
		}

		setKanbanState((prevState) => ({
			...prevState,
			[section]: [...prevState[section], placeholderCard],
		}))
		setIsAddCardVisible((prev) => ({
			...prev,
			[section]: true,
		}))
	}

	const removePlaceholderCard = (section: string) => {
		setKanbanState((prevState) => ({
			...prevState,
			[section]: prevState[section].filter((card) => !card.isCreatingMode),
		}))
		setIsAddCardVisible((prev) => ({
			...prev,
			[section]: false,
		}))
	}

	const statusMap: Record<string, string> = {
		todo: 'to_do',
		inProgress: 'in_progress',
		needReview: 'need_review',
		done: 'done',
	}

	// Function to add a task to a specified section
	const addTaskToSection = async (section: string) => {
		if (newTaskTitle.trim() === '') {
			setIsAddCardVisible((prev) => ({
				...prev,
				[section]: false,
			}))
			setKanbanState((prevState) => ({
				...prevState,
				[section]: prevState[section].filter((card) => !card.isCreatingMode),
			}))
			return
		}

		const newTask: any = {
			taskStatus: statusMap[section],
			taskTitle: newTaskTitle,
		}

		await createTask(newTask)

		// Hide the add card UI after adding the task
		setIsAddCardVisible((prev) => ({
			...prev,
			[section]: false,
		}))
		setKanbanState((prevState) => ({
			...prevState,
			[section]: prevState[section].filter((card) => !card.isCreatingMode),
		}))
		setNewTaskTitle('')
	}

	const updateTask = async () => {
		await updateTaskStatus(highlightedTaskId as string, { taskTitle: editTask })
		setEditTask('')
		setHighlightedTaskId('')
	}

	// Function to remove a task by its ID
	const removeTask = async (taskId: string) => {
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
			await deleteTaskById(taskId)
			Swal.fire({
				title: 'Deleted!',
				text: 'Your task has been deleted.',
				icon: 'success',
				showConfirmButton: false,
				timer: 2000,
			})
		}
	}

	// Function to highlight a specific task
	const highlightTask = (taskId: string) => {
		setHighlightedTaskId(taskId)
	}

	const viewTaskModal = (task: any) => {
		setSelectedTask(task)
		setIsViewTaskModalVisible(false)
	}

	const handleStatusChange = async (status: string) => {
		await updateTaskStatus(selectedTask.id, { taskStatus: status })
		setKanbanState((prevState) => formatTasks([...tasks]))
	}

	return (
		<KanbanContext.Provider
			value={{
				newTaskTitle,
				setNewTaskTitle,
				createPlaceholderCard,
				removePlaceholderCard,
				addTaskToSection,
				removeTask,
				highlightTask,
				isViewTaskModalVisible,
				setIsViewTaskModalVisible,
				viewTaskModal,
				kanbanState,
				isAddCardVisible,
				highlightedTaskId,
				selectedTask,
				setKanbanState,
				setHighlightedTaskId,
				handleStatusChange,
				editTask,
				setEditTask,
				updateTask,
				moveCard,
				handleDrop,
				showMoveModal,
				setShowMoveModal,
			}}>
			{children}
		</KanbanContext.Provider>
	)
}

// Create a custom hook for easier access to the context
export const useKanbanContext = () => {
	const context = useContext(KanbanContext)
	if (!context) {
		throw new Error('useMyContext must be used within a MyProvider')
	}
	return context
}
