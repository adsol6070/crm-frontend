import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import { PageBreadcrumb } from '@/components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { formatStringDisplayName } from '@/utils/formatString'
import styles from './kanban.module.css'
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
	CardProps,
} from '@/types/KanbanTypes'
import { useThemeContext } from '@/common'
import { kanbanBackgroundStyle, textStyle } from '@/utils'
import { BsThreeDots } from 'react-icons/bs'
import { useKanbanContext } from './KanbanContext'
import MoveModal from './modals/moveModal'

const ItemType = {
	CARD: 'card',
}

const Column = ({ title, children, status, taskCount }: ColumnProps) => {
	const { settings } = useThemeContext()
	const {
		handleDrop,
		createPlaceholderCard,
		removePlaceholderCard,
		isAddCardVisible,
		addTaskToSection,
	} = useKanbanContext()

	const [, drop] = useDrop({
		accept: ItemType.CARD,
		drop: (
			draggedItem: CardType & { status: keyof KanbanState; index: number }
		) => {
			if (draggedItem.status !== status) {
				handleDrop(draggedItem, status)
			}
		},
	})

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

				{isAddCardVisible[status] ? (
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
							onClick={() => addTaskToSection(status)}>
							Add card
						</button>
						<RxCross2
							size={24}
							color="black"
							onClick={() => removePlaceholderCard(status)}
						/>
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
						onClick={() => createPlaceholderCard(status)}>
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

const KanbanCard = ({ key, card, index, status, isHighlighted }: CardProps) => {
	const {
		newTaskTitle,
		setNewTaskTitle,
		moveCard,
		viewTaskModal,
		highlightTask,
		removeTask,
		editTask,
		setEditTask,
		addTaskToSection,
		updateTask,
		onMoveTask
	} = useKanbanContext()

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
			addTaskToSection(status)
		}
	}

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
						value={newTaskTitle}
						onChange={(e) => setNewTaskTitle(e.target.value)}
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
				) : isHighlighted ? (
					<>
						<input
							type="text"
							value={editTask.task}
							onChange={(e) => setEditTask(e.target.value)}
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
					</>
				) : (
					<>
						<Card.Title className="h6 mb-0" style={{ maxWidth: '200px' }}>
							{card.title}
						</Card.Title>
						<SlPencil
							size={14}
							className="ms-2"
							onClick={() => highlightTask(card.id)}
						/>
					</>
				)}
			</Card.Body>
			{isHighlighted && (
				<div
					className="d-flex flex-column align-items-start"
					style={{ gap: '8px', position: 'absolute', right: '-120px' }}>
					<button
						className="btn btn-light btn-sm d-flex align-items-center justify-content-start"
						onClick={() => viewTaskModal(card)}>
						<RiEyeLine size={14} style={{ marginRight: '4px' }} />
						<span>Open card</span>
					</button>
					<button
						className="btn btn-light btn-sm d-flex align-items-center justify-content-start"
						/* onClick={onMoveTask} */
						onClick={() => console.log('Move task get called.')}>
						<LuMoveRight size={14} style={{ marginRight: '4px' }} />
						Move
					</button>
					<button className="btn btn-light btn-sm d-flex align-items-center justify-content-start">
						<MdContentCopy size={14} style={{ marginRight: '4px' }} />
						Copy
					</button>
					<button
						className="btn btn-light btn-sm d-flex align-items-center justify-content-start"
						onClick={() => removeTask(card.id)}>
						<RiDeleteBinLine size={14} style={{ marginRight: '4px' }} />
						Delete
					</button>
				</div>
			)}
			{isHighlighted && (
				<div style={{ position: 'absolute', bottom: '-40px' }}>
					<button
						className="btn btn-sm"
						style={{ background: '#0c66e4', color: '#fff' }}
						onClick={() => updateTask()}>
						Save
					</button>
				</div>
			)}
		</Card>
	)
}

const Kanban = () => {
	const {
		kanbanState,
		highlightedTaskId,
		setHighlightedTaskId,
		handleStatusChange,
		isViewTaskModalVisible,
		setIsViewTaskModalVisible,
		selectedTask,
		showMoveModal,
		setShowMoveModal,
		updateTaskById,
	} = useKanbanContext()

	return (
		<DndProvider backend={HTML5Backend}>
			<Container fluid>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				{highlightedTaskId && (
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
						onClick={() => setHighlightedTaskId(null)}></div>
				)}
				<Row className="flex-nowrap my-2">
					{Object.keys(kanbanState).map((status, index) => (
						<Column
							key={index}
							title={status || 'Default Status'}
							status={status as keyof KanbanState}
							taskCount={kanbanState[status as keyof KanbanState].length}>
							{kanbanState[status as keyof KanbanState]?.map((card, index) => (
								<KanbanCard
									key={index}
									card={card}
									index={index}
									status={status as keyof KanbanState}
									isHighlighted={highlightedTaskId === card.id}
								/>
							))}
						</Column>
					))}
				</Row>
				{selectedTask && (
					<ViewTaskModal
						show={isViewTaskModalVisible}
						onHide={() => setIsViewTaskModalVisible(false)}
						task={selectedTask}
						handleStatusChange={handleStatusChange}
						updateTask={updateTaskById}
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
