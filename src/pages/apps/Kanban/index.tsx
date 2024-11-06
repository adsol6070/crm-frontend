import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { PageBreadcrumb } from '@/components'
import AddTaskModal from './AddTaskModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import useTask from './useTask'
import { formatStringDisplayName } from '@/utils/formatString'
import styles from './kanban.module.css'
import ViewTaskModal from './viewTaskModal'
import Swal from 'sweetalert2';

const ItemType = {
	CARD: 'card',
}

interface ColumnProps {
	title: string
	children: React.ReactNode
	backgroundColor: string
	onDrop: (
		card: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => void
	status: keyof KanbanState
	onAddTask: () => void
}

interface CardType {
	id: string
	title: string
	description?: string
	status?: string
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
	backgroundColor,
	onDrop,
	status,
	onAddTask
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
					<Card.Title className="fw-bold text-black">{title}</Card.Title>
					<Badge pill bg="secondary">
						1
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
					className="text-decoration-none"
					onMouseOver={(e)		 => {
						e.currentTarget.style.background = '#f0f0f0'
						e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.8)'
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.background = '#FFF'
						e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)'
					}}
					onClick={onAddTask}
				>
					+ Add New Task
				</Button>
			</div>
			<div className="d-flex flex-column gap-2">
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

const KanbanCard = ({ card, index, moveCard, status, onViewTask, onDeleteTask }: CardProps) => {
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
				<div className="d-flex justify-content-between align-items-center">
					<Button variant="outline-primary" size="sm" onClick={onViewTask}>
						View
					</Button>
					<Button variant="danger" size="sm" onClick={onDeleteTask}>
						Delete
					</Button>
					{/* <div>
						<Badge bg="light" text="dark">
							👥 3
						</Badge>{' '}
						<Badge bg="light" text="dark">
							🕒 4
						</Badge>{' '}
						<Badge bg="light" text="dark">
							💬 2
						</Badge>
					</div> */}
				</div>
			</Card.Body>
		</Card>
	)
}

const Kanban = () => {
	const [cards, setCards] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})

	const formatTasks = (tasks: any[]): KanbanState => {
		const formattedData: KanbanState = {
			todo: [],
			inProgress: [],
			needReview: [],
			done: [],
		};

		tasks.forEach((task) => {
			const formattedTask: CardType = {
				id: task.id,
				title: task.taskTitle,
				status: formatStringDisplayName(task.taskStatus),
				description: task.taskDescription,
			};

			switch (task.taskStatus) {
				case "to_do":
					formattedData.todo.push(formattedTask);
					break;
				case "in_progress":
					formattedData.inProgress.push(formattedTask);
					break;
				case "need_review":
					formattedData.needReview.push(formattedTask);
					break;
				case "done":
					formattedData.done.push(formattedTask);
					break;
				default:
					break;
			}
		});

		return formattedData;
	};

	const { tasks, deleteTaskById } = useTask();
	useEffect(() => {
		const organizedTasks = formatTasks(tasks);
		setCards(organizedTasks)
	}, [tasks])

	const [showAddTaskModal, setShowAddTaskModal] = useState(false)
	const [showViewTaskModal, setShowViewTaskModal] = useState(false)
	const [selectedTask, setSelectedTask] = useState({})
	
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
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            deleteTaskById(id);
			Swal.fire({
				title: 'Deleted!',
				text: 'Your task has been deleted.',
				icon: 'success',
				timer: 2000,
				showConfirmButton: false
			});
        }
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<Container fluid className="py-4">
				<ToastContainer />
				<PageBreadcrumb title="Task Management" subName="Kanban" />

				<Row className='flex-nowrap'>
					<Column
						title="To Do"
						backgroundColor="#0fb9b1"
						status="todo"
						onDrop={handleDrop}
						onAddTask={() => setShowAddTaskModal(true)}
					>
						{cards.todo.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="todo"
								onViewTask={() => handleViewTask(card)}
								onDeleteTask={() => handleDeleteTask(card.id)}
							/>
						))}
					</Column>
					<Column
						title="In Progress"
						backgroundColor="#8854d0"
						status="inProgress"
						onDrop={handleDrop}
						onAddTask={() => setShowAddTaskModal(true)}
					>
						{cards.inProgress.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="inProgress"
								onViewTask={() => handleViewTask(card)}
								onDeleteTask={() => handleDeleteTask(card.id)}
							/>
						))}
					</Column>
					<Column
						title="Need Review"
						backgroundColor="#a5b1c2"
						status="needReview"
						onDrop={handleDrop}
						onAddTask={() => setShowAddTaskModal(true)}
					>
						{cards.needReview.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="needReview"
								onViewTask={() => handleViewTask(card)}
								onDeleteTask={() => handleDeleteTask(card.id)}
							/>
						))}
					</Column>
					<Column
						title="Done"
						backgroundColor="#fa8231"
						status="done"
						onDrop={handleDrop}
						onAddTask={() => setShowAddTaskModal(true)}
					>
						{cards.done.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="done"
								onViewTask={() => handleViewTask(card)}
								onDeleteTask={() => handleDeleteTask(card.id)}
							/>
						))}
					</Column>
				</Row>
				<AddTaskModal
					show={showAddTaskModal}
					onHide={() => setShowAddTaskModal(false)}
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
