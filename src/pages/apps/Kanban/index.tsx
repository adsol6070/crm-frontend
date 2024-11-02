import { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'

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
}

interface CardType {
	id: number
	title: string
	description?: string
	category?: string
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
		<Col ref={drop}>
			<div className="d-flex flex-column gap-2">
				<Card.Title className="fw-bold text-black">{title}</Card.Title>
				<Button
					style={{
						background: '#FFF',
						border: 'none',
						outline: 'none',
						color: 'black',
						boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
						transition: 'background 0.3s, box-shadow 0.3s',
					}}
					size="sm"
					className="text-decoration-none"
					onMouseOver={(e) => {
						e.currentTarget.style.background = '#f0f0f0'
						e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.background = '#FFF'
						e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
					}}>
					+ Add New Task
				</Button>

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
}

const KanbanCard = ({ card, index, moveCard, status }: CardProps) => {
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
			ref={(node) => ref(drop(node))}
			className="mb-3 shadow-sm"
			style={{ cursor: 'pointer' }}>
			<Card.Body>
				<Badge bg="secondary" className="mb-2">
					{card.category || 'Category'}
				</Badge>
				<Card.Title className="h6">{card.title}</Card.Title>
				<Card.Text className="text-muted">
					{card.description || 'No description provided.'}
				</Card.Text>
				<div className="d-flex justify-content-between align-items-center">
					<Button variant="outline-primary" size="sm">
						View
					</Button>
					<div>
						<Badge bg="light" text="dark">
							👥 3
						</Badge>{' '}
						<Badge bg="light" text="dark">
							🕒 4
						</Badge>{' '}
						<Badge bg="light" text="dark">
							💬 2
						</Badge>
					</div>
				</div>
			</Card.Body>
		</Card>
	)
}

const Kanban = () => {
	const [cards, setCards] = useState<KanbanState>({
		todo: [
			{
				id: 1,
				title: 'Wireframing',
				category: 'UX stages',
				description: 'Create low-fidelity designs...',
			},
		],
		inProgress: [
			{
				id: 2,
				title: 'Customer Journey Mapping',
				category: 'UX stages',
				description: 'Identify the key touchpoints...',
			},
		],
		needReview: [
			{
				id: 3,
				title: 'Competitor Research',
				category: 'UX stages',
				description: 'Research competitors...',
			},
		],
		done: [
			{
				id: 4,
				title: 'Branding, visual identity',
				category: 'Branding',
				description: 'Create a brand identity system...',
			},
		],
	})

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
			category: draggedItem.category,
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

	return (
		<DndProvider backend={HTML5Backend}>
			<Container fluid className="py-4">
				<Row className='flex-nowrap'>
					<Column
						title="To Do"
						backgroundColor="#0fb9b1"
						status="todo"
						onDrop={handleDrop}>
						{cards.todo.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="todo"
							/>
						))}
					</Column>
					<Column
						title="In Progress"
						backgroundColor="#8854d0"
						status="inProgress"
						onDrop={handleDrop}>
						{cards.inProgress.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="inProgress"
							/>
						))}
					</Column>
					<Column
						title="Need Review"
						backgroundColor="#a5b1c2"
						status="needReview"
						onDrop={handleDrop}>
						{cards.needReview.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="needReview"
							/>
						))}
					</Column>
					<Column
						title="Done"
						backgroundColor="#fa8231"
						status="done"
						onDrop={handleDrop}>
						{cards.done.map((card, index) => (
							<KanbanCard
								key={card.id}
								card={card}
								index={index}
								moveCard={moveCard}
								status="done"
							/>
						))}
					</Column>
				</Row>
			</Container>
		</DndProvider>
	)
}

export default Kanban
