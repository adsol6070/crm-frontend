import { useEffect, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ToastContainer } from 'react-toastify'
import { useKanbanContext } from './KanbanContext'
import { PageBreadcrumb } from '@/components'
import ViewTaskModal from './modals/viewTaskModal'
import MoveModal from './modals/moveModal'
import CopyModal from './modals/copyModal'
import Column from './components/Column'
import KanbanCard from './components/Card'
import Overlay from './components/Overlay'
import AddListForm from './components/AddListForm'
import 'react-toastify/ReactToastify.css'

const styles = {
	container: {
		backgroundImage: 'url("/images/kanban-background.png")',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
		padding: '1rem',
	},
	board: {
		flexGrow: 1,
		marginTop: '12px',
		position: 'relative',
		height: '77vh',
	},
	columnList: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: '-2px',
		marginBottom: '8px',
		padding: '2px 6px 8px',
		overflowX: 'auto',
		overflowY: 'hidden',
		scrollbarColor: '#fff6 #00000026',
		scrollbarWidth: 'auto',
		userSelect: 'none',
		whiteSpace: 'nowrap',
		display: 'flex',
		listStyle: 'none',
	},
}

const Kanban = () => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const {
		kanbanState,
		highlightedTaskId,
		handleStatusChange,
		modalState,
		toggleModal,
		selectedTask,
		updateTaskById,
		openColumnStatus,
		createTask,
	} = useKanbanContext()

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

	return (
		<DndProvider backend={HTML5Backend}>
			<div style={styles.container}>
				<ToastContainer />
				<PageBreadcrumb title="Kanban" subName="Kanban" />
				<div style={styles.board}>
					<ol style={styles.columnList}>
						{kanbanState.columns?.map((column, index) => (
							<Column
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
					</ol>
				</div>

				{/* Modals */}
				{selectedTask && (
					<>
						<ViewTaskModal
							show={modalState.viewTask}
							onHide={() => toggleModal('viewTask', false)}
							task={selectedTask}
							handleStatusChange={handleStatusChange}
							updateTask={updateTaskById}
						/>

						<MoveModal
							show={modalState.moveTask}
							onHide={() => toggleModal('moveTask', false)}
							task={selectedTask}
							handleStatusChange={handleStatusChange}
						/>

						<CopyModal
							show={modalState.copyTask}
							onHide={() => toggleModal('copyTask', false)}
							task={selectedTask}
							createTask={createTask}
						/>
					</>
				)}
			</div>
			{highlightedTaskId && <Overlay />}
		</DndProvider>
	)
}

export default Kanban
