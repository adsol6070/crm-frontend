import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import { PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import { formatStringDisplayName } from '@/utils/formatString'
import 'react-toastify/ReactToastify.css'
import Swal from 'sweetalert2'
import styles from './kanban.module.css'
import useTask from './useTask'
import { RiDeleteBinLine, RiEyeLine, RiAddLine } from 'react-icons/ri'
import AddTaskModal from './modals/AddTaskModal'
import ViewTaskModal from './modals/viewTaskModal'
import {
	ColumnProps,
	CardType,
	KanbanState,
	Task,
	CardProps,
	CreateData,
} from '@/types/KanbanTypes'

const ItemType = {
	CARD: 'card',
}

const formatTask = (task: Task): CardType => ({
	id: task.id,
	title: task.taskTitle,
	status: formatStringDisplayName(task.taskStatus),
	description: task.taskDescription,
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

const Column = ({
	title,
	children,
	onDrop,
	status,
	onAddTask,
	taskCount,
}: ColumnProps) => {
	const [, drop] = useDrop({
		accept: ItemType.CARD,
		drop: (
			draggedItem: CardType & { status: keyof KanbanState; index: number }
		) => {
			if (draggedItem.status !== status) {
				onDrop(draggedItem, status)
			}
		},
	})

	return (
		<Col ref={drop} className={styles.colDesign}>
			<div className={styles.headerDesign}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<span
						style={{
							height: '8px',
							width: '8px',
							background: 'green',
							borderRadius: '50%',
							lineHeight: '3px',
						}}></span>
					<Card.Title className="fw-bold text-black m-1">
						{formatStringDisplayName(title)}
					</Card.Title>
					<Badge pill bg="secondary">
						{taskCount}
					</Badge>
				</div>
				<div
					style={{
						color: 'black',
						padding: '5px',
						transition: 'background 0.3s',
					}}
					className="text-decoration-none m-1"
					onMouseOver={(e) => {
						e.currentTarget.style.background = '#f0f0f0'
						e.currentTarget.style.borderRadius = '50%'
						e.currentTarget.style.cursor = 'pointer'
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.background = '#FFF'
						e.currentTarget.style.borderRadius = '50%'
					}}
					onClick={onAddTask}>
					<RiAddLine size={24} />
				</div>
			</div>
			<div className={`d-flex flex-column gap-2 ${styles.barDesign}`}>
				<div>{children}</div>
			</div>
		</Col>
	)
}

const KanbanCard = ({
	card,
	index,
	moveCard,
	status,
	onViewTask,
	onDeleteTask,
}: CardProps) => {
	const [, ref] = useDrag({
		type: ItemType.CARD,
		item: { ...card, index, status },
	})

	const [, drop] = useDrop({
		accept: ItemType.CARD,
		hover: (
			draggedItem: CardType & { index: number; status: keyof KanbanState }
		) => {
			if (draggedItem.index !== index || draggedItem.status !== status) {
				moveCard(draggedItem, index, status)
				draggedItem.index = index
				draggedItem.status = status
			}
		},
	})

	return (
		<Card
			ref={(node: any) => ref(drop(node))}
			className={`mb-3 ${styles.cardDesign}`}
			style={{ cursor: 'pointer' }}>
			<Card.Body>
				<Badge bg="secondary" className="mb-2">
					{card.status || 'Status'}
				</Badge>
				<Card.Title className="h6">{card.title}</Card.Title>
				<Card.Text className="text-muted">
					{card.description || 'No description provided.'}
				</Card.Text>
				<div className="d-flex align-items-center">
					<RiEyeLine size={18} className="mx-1" onClick={onViewTask} />
					<RiDeleteBinLine
						size={18}
						className="mx-1"
						color="red"
						onClick={onDeleteTask}
					/>
				</div>
			</Card.Body>
		</Card>
	)
}

const Kanban = () => {
	const { tasks, createTask, deleteTaskById, updateTaskStatus } = useTask()
	const [kanbanState, setKanbanState] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})
	const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false)
	const [showViewTaskModal, setShowViewTaskModal] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState({})
	// console.log("cards ", cards)

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

	const handleCreateTask = async (data: CreateData) => {
		await createTask(data)
		setShowAddTaskModal(false)
	}

	const handleViewTask = (task: CardType) => {
		setSelectedTask(task)
		setShowViewTaskModal(true)
	}

	const handleDeleteTask = async (id: string) => {
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
			await deleteTaskById(id)
			Swal.fire({
				title: 'Deleted!',
				text: 'Your task has been deleted.',
				icon: 'success',
				showConfirmButton: false,
				timer: 2000,
			})
		}
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<Container fluid>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				<Row className="flex-nowrap">
					{Object.keys(kanbanState).map((status, index) => (
						<Column
							key={index}
							title={status}
							status={status as keyof KanbanState}
							onDrop={handleDrop}
							onAddTask={() => setShowAddTaskModal(true)}
							taskCount={kanbanState[status as keyof KanbanState].length}>
							{kanbanState[status as keyof KanbanState]?.map((card, index) => (
								<KanbanCard
									key={index}
									card={card}
									index={index}
									moveCard={moveCard}
									status={status as keyof KanbanState}
									onViewTask={() => handleViewTask(card)}
									onDeleteTask={() => handleDeleteTask(card.id)}
								/>
							))}
						</Column>
					))}
				</Row>
				<AddTaskModal
					show={showAddTaskModal}
					onHide={() => setShowAddTaskModal(false)}
					handleCreateTask={handleCreateTask}
				/>
				{selectedTask && (
					<ViewTaskModal
						show={showViewTaskModal}
						onHide={() => setShowViewTaskModal(false)}
						task={selectedTask}
					/>
				)}
			</Container>
		</DndProvider>
	)
}

export default Kanban
