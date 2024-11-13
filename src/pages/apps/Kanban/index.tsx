import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import { PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { formatStringDisplayName } from '@/utils/formatString'
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
import { useThemeContext } from '@/common'
import { kanbanBackgroundStyle, textStyle } from '@/utils'
import { useParams } from 'react-router-dom'
import { BsThreeDots } from 'react-icons/bs'

const ItemType = {
	CARD: 'card',
}

const formatTask = (task: Task): CardType => ({
	id: task.id,
	title: task.taskTitle,
	status: formatStringDisplayName(task.taskStatus),
	description: task.taskDescription,
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
	const { settings } = useThemeContext()

	return (
		<Col
			ref={drop}
			style={{
				height: "80vh"
			}}
		>
			<div className={styles.colDesign}
				style={{
					...kanbanBackgroundStyle(settings.theme === 'dark'),
					borderRadius: '12px',
					boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
					marginBottom: '1rem',
					padding: '10px',
				}}>
				<div
					id="header"
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '10px 20px',
						borderRadius: '8px',
						marginBottom: '10px',
					}}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Card.Title
							className="fw-bold m-1"
							style={textStyle(settings.theme === 'dark')}>
							{formatStringDisplayName(title)}
						</Card.Title>
						<Badge pill bg="secondary">
							{taskCount}
						</Badge>
					</div>
					<BsThreeDots
						size={20}
						style={{
							cursor: 'pointer',
							color: settings.theme === 'dark' ? '#ffffff' : '#333333',
						}}
					/>
				</div>

				<div style={{ marginInline: '5px' }}>{children}</div>

				<div
					id="footer"
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '10px 20px',
						borderRadius: '8px',
						marginTop: '10px',
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.background = '#e6e6e6'
						e.currentTarget.style.cursor = 'pointer'
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.background = '#FFF'
					}}
					onClick={onAddTask}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<RiAddLine size={20} color="black" />
						<Card.Title
							className="m-1"
							style={textStyle(settings.theme === 'dark')}>
							Add a card
						</Card.Title>
					</div>
				</div>
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
	const [{ isDragging }, ref] = useDrag({
		type: ItemType.CARD,
		item: { ...card, index, status },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
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
	const truncatedDescription = card.description
		? card.description.length > 30
			? `${card.description.slice(0, 30)}...`
			: card.description
		: 'No description provided.'

	const cardStyle = {
		cursor: 'pointer',
		opacity: isDragging ? 0.6 : 1,
		transform: isDragging
			? 'rotate(10deg) scale(1.05)'
			: 'rotate(0deg) scale(1)',
		boxShadow: isDragging
			? '0px 6px 15px rgba(0, 0, 0, 0.3)'
			: '0px 2px 5px rgba(0, 0, 0, 0.1)',
		transition: 'all 0.3s ease',
	}

	return (
		<Card
			ref={(node: any) => ref(drop(node))}
			className={`${styles.cardDesign}`}
			style={{ ...cardStyle, marginBottom: '10px' }}>
			<Card.Body>
				<Badge bg="secondary" className="mb-2">
					{card.status || 'Status'}
				</Badge>
				<Card.Title className="h6">{card.title}</Card.Title>
				<Card.Text className="text-muted">{truncatedDescription}</Card.Text>
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
	const { boardId } = useParams() as { boardId: string }
	const {
		tasks,
		createTask,
		deleteTaskById,
		updateTaskStatus,
	} = useTask(boardId)
	const [kanbanState, setKanbanState] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})
	const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false)
	const [showViewTaskModal, setShowViewTaskModal] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState({})

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
				<Row className="flex-nowrap my-2">
					{Object.keys(kanbanState).map((status, index) => (
						// <div style={{ display: "inline-flex", flexDirection: "column", width: "100%" }}>
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
						// </div>
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
