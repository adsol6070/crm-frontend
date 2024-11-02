import { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PageBreadcrumb } from '@/components'

const ItemType = {
	CARD: 'card',
} as const

interface ColumnProps {
	title: string
	children: React.ReactNode
	backgroundColor: string
	onDrop: (
		card: CardType & { status: keyof KanbanState; index: number },
		status: keyof KanbanState
	) => void
	status: keyof KanbanState
}

interface CardType {
	id: number
	title: string
}

interface KanbanState {
	todo: CardType[]
	inProgress: CardType[]
	done: CardType[]
}

const Column = ({
	title,
	children,
	backgroundColor,
	onDrop,
	status,
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
		<div
			ref={drop}
			style={{
				flex: 1,
				padding: '20px',
				backgroundColor: backgroundColor,
				minHeight: '450px',
				borderRadius: '12px',
				margin: '0 10px',
				boxShadow: '0 6px 14px rgba(0, 0, 0, 0.1)',
				overflowY: 'auto',
			}}>
			<h2
				style={{
					fontSize: '20px',
					fontWeight: 'bold',
					color: '#444',
					paddingBottom: '12px',
					borderBottom: '3px solid #ddd',
					textTransform: 'uppercase',
				}}>
				{title}
			</h2>
			<div style={{ marginTop: '20px' }}>{children}</div>
		</div>
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
}

const Card = ({ card, index, moveCard, status }: CardProps) => {
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
		<div
			ref={(node) => ref(drop(node))}
			style={{
				padding: '16px',
				margin: '10px 0',
				backgroundColor: '#ffffff',
				borderRadius: '8px',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
				cursor: 'grab',
				transition: 'background-color 0.3s',
			}}>
			<h3
				style={{
					fontSize: '18px',
					fontWeight: '600',
					color: '#333',
					margin: 0,
				}}>
				{card.title}
			</h3>
		</div>
	)
}

const KanbanLogic = () => {
	const [cards, setCards] = useState<KanbanState>({
		todo: [],
		inProgress: [],
		done: [],
	})

	const [newTask, setNewTask] = useState<string>('')

	useEffect(() => {
		const savedCards = localStorage.getItem('kanbanCards')
		if (savedCards) {
			setCards(JSON.parse(savedCards))
		}
	}, [])

	useEffect(() => {
		localStorage.setItem('kanbanCards', JSON.stringify(cards))
	}, [cards])

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

	const addNewTask = () => {
		if (newTask.trim()) {
			const newTaskId = Date.now() + Math.random()
			const updatedTodoCards = [
				...cards.todo,
				{ id: newTaskId, title: newTask.trim() },
			]

			setCards((prevCards) => ({
				...prevCards,
				todo: updatedTodoCards,
			}))
			setNewTask('')
		}
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<PageBreadcrumb title="Kanban Board" subName="Manage Your Workflow" />
			<div
				style={{
					display: 'flex',
					gap: '20px',
					padding: '30px',
					backgroundColor: '#f8fafc',
					borderRadius: '15px',
					boxShadow: '0 3px 15px rgba(0, 0, 0, 0.1)',
					margin: '30px auto',
					maxWidth: '1200px',
				}}>
				<Column
					title="To Do"
					backgroundColor="#FFF6E5"
					status="todo"
					onDrop={handleDrop}>
					{cards.todo.map((card, index) => (
						<Card
							key={card.id}
							card={card}
							index={index}
							moveCard={moveCard}
							status="todo"
						/>
					))}
					<div style={{ marginTop: '16px' }}>
						<input
							type="text"
							placeholder="Add new task..."
							value={newTask}
							onChange={(e) => setNewTask(e.target.value)}
							style={{
								width: '100%',
								padding: '10px',
								borderRadius: '8px',
								border: '1px solid #ccc',
								marginBottom: '10px',
							}}
						/>
						<button
							onClick={addNewTask}
							style={{
								width: '100%',
								padding: '10px',
								borderRadius: '8px',
								backgroundColor: '#007bff',
								color: 'white',
								border: 'none',
								cursor: 'pointer',
								fontWeight: 'bold',
								transition: 'background-color 0.3s',
							}}>
							Add Task
						</button>
					</div>
				</Column>

				<Column
					title="In Progress"
					backgroundColor="#DFF2FF"
					status="inProgress"
					onDrop={handleDrop}>
					{cards.inProgress.map((card, index) => (
						<Card
							key={card.id}
							card={card}
							index={index}
							moveCard={moveCard}
							status="inProgress"
						/>
					))}
				</Column>

				<Column
					title="Done"
					backgroundColor="#E6FFEA"
					status="done"
					onDrop={handleDrop}>
					{cards.done.map((card, index) => (
						<Card
							key={card.id}
							card={card}
							index={index}
							moveCard={moveCard}
							status="done"
						/>
					))}
				</Column>
			</div>
		</DndProvider>
	)
}

export default KanbanLogic
