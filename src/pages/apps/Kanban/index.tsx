import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import { formatStringDisplayName } from '@/utils/formatString'
import 'react-toastify/ReactToastify.css'
import Swal from 'sweetalert2'
import styles from './kanban.module.css'
import useTask from './useTask'
import AddTaskModal from './AddTaskModal'
import ViewTaskModal from './viewTaskModal'
import { RiDeleteBinLine, RiEyeLine } from 'react-icons/ri';

const ItemType = {
	CARD: 'card',
}

interface ColumnProps {
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

interface CardType {
	id: string
	title: string
	description?: string
	status?: string
	createdAt?: string
}

interface KanbanState {
	todo: CardType[]
	inProgress: CardType[]
	needReview: CardType[]
	done: CardType[]
}

const Column = ({
	title,
	children,
	onDrop,
	status,
	onAddTask,
	taskCount
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
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<span
						style={{
							height: '8px',
							width: '8px',
							background: 'green',
							borderRadius: '50%',
							lineHeight: '3px',
						}}></span>
					<Card.Title className="fw-bold text-black m-1">{title}</Card.Title>
					<Badge pill bg="secondary">
						{taskCount}
					</Badge>
				</div>
				<Button
					style={{
						background: '#FFF',
						border: 'none',
						outline: 'none',
						color: 'black',
						boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
						transition: 'background 0.3s, box-shadow 0.3s',
					}}
					size="sm"
					className="text-decoration-none m-1"
					onMouseOver={(e) => {
						e.currentTarget.style.background = '#f0f0f0'
						e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.8)'
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.background = '#FFF'
						e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)'
					}}
					onClick={onAddTask}>
					+ Add New Task
				</Button>
			</div>
			<div className={`d-flex flex-column gap-2 ${styles.barDesign}`}>
				<div>{children}</div>
			</div>
		</Col>
	)
}

interface CardProps {
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
					<RiEyeLine size={18} className="mx-1" color="blue" onClick={onViewTask} />
					<RiDeleteBinLine size={18} className="mx-1" color="red" onClick={onDeleteTask} />
				</div>
			</Card.Body>
		</Card>
	)
}

const formatTask = (task): CardType => ({
	id: task.id,
	title: task.taskTitle,
	status: formatStringDisplayName(task.taskStatus),
	description: task.taskDescription,
	createdAt: task.created_at,
})

const formatTasks = (tasks: any[]): KanbanState => {
	const formattedData: KanbanState = {
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	}

	const statusMap = {
		to_do: 'todo',
		in_progress: 'inProgress',
		need_review: 'needReview',
		done: 'done',
	}

	tasks.forEach((task) => {
		const formattedTask: CardType = formatTask(task)

		const kanbanKey = statusMap[task.taskStatus]
		formattedData[kanbanKey].push(formattedTask)
	})

	return formattedData
}

const Kanban = () => {
	const [cards, setCards] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})
	const { tasks, createTask, deleteTaskById } = useTask()
	const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false)
	const [showViewTaskModal, setShowViewTaskModal] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState({})
	console.log("cards ", cards)

	useEffect(() => {
		setCards(formatTasks(tasks))
	}, [tasks])

	const moveCard = (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		newIndex: number,
		newStatus: keyof KanbanState
	) => {
		const { id, status: oldStatus, index: oldIndex } = draggedItem

		if (oldStatus === newStatus && oldIndex === newIndex) {
			return
		}

		const updatedOldStatusCards = [...cards[oldStatus]].filter(
			(card) => card.id !== id
		)
		const updatedNewStatusCards =
			oldStatus === newStatus ? updatedOldStatusCards : [...cards[newStatus]]
		updatedNewStatusCards.splice(newIndex, 0, {
			id,
			title: draggedItem.title,
			status: draggedItem.status,
			description: draggedItem.description,
		})

		setCards((prevCards) => ({
			...prevCards,
			[oldStatus]: updatedOldStatusCards,
			[newStatus]: updatedNewStatusCards,
		}))
	}

	const handleDrop = (
		draggedItem: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => {
		moveCard(draggedItem, cards[status].length, status)
	}

	const handleCreateTask = async (data: any) => {
		await createTask(data)
		setShowAddTaskModal(false)
	}

	const handleViewTask = (task: CardType) => {
		setSelectedTask(task)
		setShowViewTaskModal(true)
	}

	const handleDeleteTask = async (id: string) => {
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		})

		if (result.isConfirmed) {
			deleteTaskById(id)
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
					{(
						['todo', 'inProgress', 'needReview', 'done'] as Array<
							keyof KanbanState
						>
					).map((status) => (
						<Column
							title={status}
							status={status}
							onDrop={handleDrop}
							onAddTask={() => setShowAddTaskModal(true)}
							taskCount={cards[status].length}
							>
							{cards[status]?.map((card, index) => (
								<KanbanCard
									key={card.id}
									card={card}
									index={index}
									moveCard={moveCard}
									status={status}
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
