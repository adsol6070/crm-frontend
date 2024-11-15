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
import { RxCross2 } from 'react-icons/rx'
import { LuMoveRight } from 'react-icons/lu'
import { SlPencil } from 'react-icons/sl'
import { MdContentCopy } from 'react-icons/md'
import ViewTaskModal from './modals/viewTaskModal'
import {
	ColumnProps,
	CardType,
	KanbanState,
	Task,
	CardProps,
} from '@/types/KanbanTypes'
import { useThemeContext } from '@/common'
import { kanbanBackgroundStyle, textStyle } from '@/utils'
import { useParams } from 'react-router-dom'
import { BsThreeDots } from 'react-icons/bs'
import MoveModal from './modals/moveModal'

const ItemType = {
	CARD: 'card',
}

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

const Column = ({
	title,
	task,
	setNewTask,
	children,
	onDrop,
	status,
	onAddTask,
	setKanbanState,
	isAdding,
	setIsAdding,
	taskCount,
	handleCreateTask,
	addCard
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

	

	const removeCard = () => {
		setKanbanState((prevState) => ({
			...prevState,
			[status]: prevState[status].filter((card) => !card.isCreatingMode),
		}))
		setIsAdding((prev) => ({
			...prev,
			[status]: false,
		}))
	}

	return (
		<Col
			ref={drop}
			style={{
				height: '80vh',
			}}>
			<div
				className={styles.colDesign}
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

				{isAdding[status] ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: '15px',
							marginInline: '5px',
							background: 'none',
						}}>
						<button
							className="btn btn-sm"
							style={{ background: '#0c66e4', color: '#fff' }}
							onClick={() => addCard(status)}>
							Add card
						</button>
						<RxCross2 size={24} color="black" onClick={removeCard} />
					</div>
				) : (
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
				)}
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
	onMoveTask,
	onEdit,
	task,
	setNewTask,
	onDeleteTask,
	addCard,
	isHighlighted,
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

	const cardStyle = {
		position: 'relative',
		cursor: 'pointer',
		opacity: isDragging ? 0.6 : 1,
		boxShadow: isDragging
			? '0px 6px 15px rgba(0, 0, 0, 0.3)'
			: '0px 0px 5px rgba(0, 0, 0, 0.2)',
		transition: 'all 0.3s ease',
		zIndex: isHighlighted ? 1000 : 'auto',
		transform:
			isDragging && !isHighlighted
				? 'rotate(5deg) scale(1.05)'
				: isHighlighted
					? 'scale(1.05)'
					: 'none',
		borderRadius: '12px',
		marginBottom: '10px',
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addCard(status); // Call the addCard function when Enter is pressed
        }
    };

	return (
		<Card ref={(node: any) => ref(drop(node))} style={{ ...cardStyle }}>
			<Card.Body
				style={{
					position: 'relative',
					padding: card.isCreatingMode ? '0px' : '15px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}>
				{card.isCreatingMode ? (
					<input
						type="text"
						value={task}
						onChange={(e) => setNewTask(e.target.value)}
						className="form-control"
						onKeyDown={handleKeyDown}
						style={{
							fontWeight: 'bold',
							padding: '15px',
							borderRadius: '12px',
						}}
						placeholder="Enter a title or paste a link"
						autoFocus
					/>
				) : (
					<>
						<Card.Title className="h6 mb-0" style={{ maxWidth: '200px' }}>
							{card.title}
						</Card.Title>
						<SlPencil size={14} className="ms-2" onClick={() => onEdit()} />
					</>
				)}
			</Card.Body>
			{isHighlighted && (
				<div
					className="d-flex flex-column align-items-start"
					style={{ gap: '8px', position: 'absolute', right: '-120px' }}>
					<button
						className="btn btn-light btn-sm d-flex align-items-center justify-content-start"
						onClick={onViewTask}>
						<RiEyeLine size={14} style={{ marginRight: '4px' }} />
						<span>Open card</span>
					</button>
					<button className="btn btn-light btn-sm d-flex align-items-center justify-content-start" onClick={onMoveTask}>
						<LuMoveRight size={14} style={{ marginRight: '4px' }} />
						Move
					</button>
					<button className="btn btn-light btn-sm d-flex align-items-center justify-content-start">
						<MdContentCopy size={14} style={{ marginRight: '4px' }} />
						Copy
					</button>
					<button
						className="btn btn-light btn-sm d-flex align-items-center justify-content-start"
						onClick={onDeleteTask}>
						<RiDeleteBinLine size={14} style={{ marginRight: '4px' }} />
						Delete
					</button>
				</div>
			)}
			{isHighlighted && (
				<div style={{ position: 'absolute', bottom: '-40px' }}>
					<button
						className="btn btn-sm"
						style={{ background: '#0c66e4', color: '#fff' }}>
						Save
					</button>
				</div>
			)}
		</Card>
	)
}

const Kanban = () => {
	const { boardId } = useParams() as { boardId: string }
	const { tasks, createTask, deleteTaskById, updateTaskStatus } =
		useTask(boardId)
	const [kanbanState, setKanbanState] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		needReview: [],
		done: [],
	})
	const [task, setNewTask] = useState('')
	const [showViewTaskModal, setShowViewTaskModal] = useState<boolean>(false)
	const [showMoveModal, setShowMoveModal] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState({})
	const [isAdding, setIsAdding] = useState<Record<string, boolean>>({
		todo: false,
		inProgress: false,
		needReview: false,
		done: false,
	})

	const [highlightedCardId, setHighlightedCardId] = useState<string | null>(
		null
	)

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

	const handleCreateTask = async (data: any) => {
		await createTask(data)
	}

	const handleViewTask = (task: CardType) => {
		setSelectedTask(task)
		setShowViewTaskModal(true)
	}

	const handleMoveTask = (task: CardType) => {
		setSelectedTask(task)
		setShowMoveModal(true)
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

	const handleStatusChange = async (status: string) => {
		await updateTaskStatus(selectedTask.id, { taskStatus: status })
		setKanbanState((prevState) => formatTasks([...tasks]))
		setShowMoveModal(false)
		setShowViewTaskModal(false)
		setHighlightedCardId(null)
	}

	const handleAddCard = (status: string) => {
		const emptyCard = {
			isCreatingMode: true,
		}

		setKanbanState((prevState) => ({
			...prevState,
			[status]: [...prevState[status], emptyCard],
		}))
		setIsAdding((prev) => ({
			...prev,
			[status]: true,
		}))
	}

	const statusMap: Record<string, string> = {
		todo: 'to_do',
		inProgress: 'in_progress',
		needReview: 'need_review',
		done: 'done',
	}

	const addCard = async (status: string) => {
		if (task.trim() === '') {
			setIsAdding((prev) => ({
				...prev,
				[status]: false,
			}))
			setKanbanState((prevState) => ({
				...prevState,
				[status]: prevState[status].filter((card) => !card.isCreatingMode),
			}))
			return
		}
		await handleCreateTask({ taskStatus: statusMap[status], taskTitle: task })
		setIsAdding((prev) => ({
			...prev,
			[status]: false,
		}))
		setKanbanState((prevState) => ({
			...prevState,
			[status]: prevState[status].filter((card) => !card.isCreatingMode),
		}))
		setNewTask('')
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<Container fluid>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				{highlightedCardId && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: 'rgba(0, 0, 0, 0.7)',
							zIndex: 999,
						}}
						onClick={() => setHighlightedCardId(null)}></div>
				)}
				<Row className="flex-nowrap my-2">
					{Object.keys(kanbanState).map((status, index) => (
						<Column
							key={index}
							title={status || 'Default Status'}
							task={task}
							setNewTask={setNewTask}
							isAdding={isAdding}
							setIsAdding={setIsAdding}
							status={status as keyof KanbanState}
							setKanbanState={setKanbanState}
							onDrop={handleDrop}
							onAddTask={() => handleAddCard(status)}
							handleCreateTask={handleCreateTask}
							addCard={addCard}
							taskCount={kanbanState[status as keyof KanbanState].length}>
							{kanbanState[status as keyof KanbanState]?.map((card, index) => (
								<KanbanCard
									key={index}
									card={card}
									index={index}
									task={task}
									setNewTask={setNewTask}
									moveCard={moveCard}
									status={status as keyof KanbanState}
									onViewTask={() => handleViewTask(card)}
									onMoveTask={() => handleMoveTask(card)}
									onDeleteTask={() => handleDeleteTask(card.id)}
									onEdit={() => setHighlightedCardId(card.id)}
									isHighlighted={highlightedCardId === card.id}
									addCard={addCard}
								/>
							))}
						</Column>
					))}
				</Row>
				{selectedTask && (
					<ViewTaskModal
						show={showViewTaskModal}
						onHide={() => setShowViewTaskModal(false)}
						task={selectedTask}
						handleStatusChange={handleStatusChange}
					/>
				)}
				{selectedTask && (
					<MoveModal
						show={showMoveModal}
						onHide={() => setShowMoveModal(false)}
						task={selectedTask}
						handleStatusChange={handleStatusChange}
					/>
				)}
			</Container>
		</DndProvider>
	)
}

export default Kanban
