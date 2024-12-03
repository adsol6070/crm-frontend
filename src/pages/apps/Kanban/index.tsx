import { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { ToastContainer } from 'react-toastify'
import { PageBreadcrumb } from '@/components'
import { useKanbanContext } from './KanbanContext'
import ViewTaskModal from './modals/viewTaskModal'
import CopyModal from './modals/copyModal'
import Column from './components/Column'
import KanbanCard from './components/Card'
import Overlay from './components/Overlay'
import AddListForm from './components/AddListForm'
import styled from 'styled-components'
import 'react-toastify/ReactToastify.css'
import { taskApi } from '@/common'

const Container = styled.div`
	background-image: url('/images/kanban-background.png');
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;
	padding: 1rem;
`

const Board = styled.div`
	flex-grow: 1;
	margin-top: 12px;
	position: relative;
	height: 77vh;
`

const ColumnList = styled.ol`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	top: -2px;
	margin-bottom: 8px;
	padding: 2px 6px 8px;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-color: #fff6 #00000026;
	scrollbar-width: auto;
	user-select: none;
	white-space: nowrap;
	display: flex;
	list-style: none;
`

const Kanban = () => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const {
		boardId,
		kanbanState,
		highlightedTaskId,
		handleStatusChange,
		modalState,
		toggleModal,
		selectedTask,
		updateTaskById,
		openColumnStatus,
		createTask,
		setKanbanState,
	} = useKanbanContext()

	const [, drop] = useDrop({
		accept: 'column',
		drop: async (item, monitor) => {
			const dragIndex = kanbanState.columns.findIndex(
				(col) => col.id === item?.columnId
			)
			const clientOffset = monitor.getClientOffset()
			const hoverIndex = kanbanState.columns.findIndex((col, index) => {
				const rect = document
					.getElementById(`column-${col.id}`)
					.getBoundingClientRect()
				return (
					clientOffset &&
					clientOffset.x >= rect.left &&
					clientOffset.x <= rect.right
				)
			})

			if (dragIndex === hoverIndex) {
				return
			}

			const newColumns = [...kanbanState.columns]
			const [removed] = newColumns.splice(dragIndex, 1)
			newColumns.splice(hoverIndex, 0, removed)

			const columnsWithOrder = newColumns.map((col, index) => ({
				...col,
				order: index + 1,
			}))

			setKanbanState({ ...kanbanState, columns: columnsWithOrder })

			const orderedColumns = columnsWithOrder.map((col) => ({
				columnId: col.id,
				order: col.order,
			}))

			try {
				await taskApi.updateColumnOrder(orderedColumns, boardId)
			} catch (error) {
				console.error('Error updating column order:', error)
			}
		},
	})

	useEffect(() => {
		if (highlightedTaskId && textareaRef.current) {
			setTimeout(() => {
				textareaRef.current?.focus()
				textareaRef.current?.setSelectionRange(
					0,
					textareaRef.current?.value.length
				)
			}, 0)
		}
	}, [highlightedTaskId])

	const sortedColumns = kanbanState.columns?.length
		? kanbanState.columns.some((col) => col.order)
			? kanbanState.columns.sort((a, b) => a.order - b.order)
			: kanbanState.columns
		: []

	return (
		<>
			<Container>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				<Board>
					<ColumnList ref={drop}>
						{sortedColumns?.map((column, index) => (
							<Column
								id={`column-${column.id}`}
								key={index}
								columnId={column.id}
								title={column.name || 'Default Status'}
								status={column.name}
								taskCount={column.cards.length}
								isFormVisible={openColumnStatus === column.id}>
								{column.cards.map((card, cardIndex) => (
									<KanbanCard
										key={card.id}
										card={card}
										index={cardIndex}
										status={column.name}
										columnId={column.id}
									/>
								))}
							</Column>
						))}
						<AddListForm />
					</ColumnList>
				</Board>

				{selectedTask && (
					<>
						<ViewTaskModal
							show={modalState.viewTask}
							onHide={() => toggleModal('viewTask', false)}
							task={selectedTask}
							handleStatusChange={handleStatusChange}
							updateTask={updateTaskById}
						/>
						<CopyModal
							show={modalState.copyTask}
							onHide={() => toggleModal('copyTask', false)}
							task={selectedTask}
							createTask={createTask}
						/>
					</>
				)}
			</Container>
			{highlightedTaskId && <Overlay />}
		</>
	)
}

export default Kanban
