import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useKanbanContext } from '../KanbanContext'
import { AiOutlinePlus } from 'react-icons/ai'
import { LuMoveRight } from 'react-icons/lu'
import { MdContentCopy } from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'
import styled from 'styled-components'
import MoveModal from '../modals/moveModal'
import useTask from '../useTask'
import { useThemeContext } from '@/common'

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: #00000099;
	z-index: 11;
`

const ModalContent = styled.div<{ top: any; left: any; width: any }>`
	position: fixed;
	top: ${({ top }) => top}px;
	left: ${({ left }) => left}px;
	width: ${({ width }) => width}px;
	z-index: 999999999;
`

const TextAreaContainer = styled.div<{ isDark: boolean }>`
	position: relative;
	min-height: 36px;
	border-radius: 8px;
	background: ${({ isDark }) => (isDark ? '#22272b' : 'white')};
	cursor: pointer;
	scroll-margin: 8px;
`

const TextAreaWrapper = styled.div`
	display: flow-root;
	position: relative;
	z-index: 10;
	min-height: 24px;
	padding: 8px 12px 4px;
`

const StyledTextArea = styled.textarea<{ isDark: boolean }>`
	height: 56px;
	background-color: unset;
	margin-bottom: 4px;
	padding: 0;
	overflow: hidden;
	overflow-wrap: break-word;
	resize: none;
	width: 100%;
	border: none;
	border-radius: 3px;
	box-sizing: border-box;
	display: block;
	line-height: 20px;
	outline: none;
	font-size: 14px;
	font-weight: 400;
	color: ${({ isDark }) => (isDark ? '#B6C2CF' : '#000')};
`

const SaveButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border: none;
	background-color: #579dff;
	color: #1d2125;
	margin-top: 8px;
	margin-bottom: 0;
	padding: 6px 12px;
	border-radius: 3px;
	text-decoration: none;
	white-space: normal;
	cursor: pointer;
	font-weight: 500;
`

const ActionButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	margin: 0px;
	padding: 6px 12px 6px 10px;
	border-radius: 3px;
	text-decoration: none;
	user-select: none;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
	margin-bottom: 4px;
`

const Overlay = () => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const moveButtonRef = useRef<HTMLButtonElement | null>(null)
	const [isMoveDivVisible, setIsMoveDivVisible] = useState(false)
	const {
		setHighlightedTaskId,
		editTask,
		setEditTask,
		taskCardDimensions,
		updateTask,
		toggleModal,
		removeTask,
		handleStatusChange,
		selectedTask,
	} = useKanbanContext()
	const { settings } = useThemeContext()
	const [status, setStatus] = useState(selectedTask.status)
	const { getTaskColumns } = useTask(selectedTask.boardId)
	const [columns, setColumns] = useState<{ id: string; name: string }[]>([])

	const getCols = async () => {
		const cols = await getTaskColumns()
		setColumns(cols)
	}

	useEffect(() => {
		getCols()
	}, [])

	const toggleMoveDiv = () => {
		setIsMoveDivVisible(!isMoveDivVisible)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			updateTask()
		}
	}

	const handleTaskUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		updateTask()
	}

	const handleMoveClick = (columnID: string) => {
		if (status) {
			handleStatusChange(status, columnID)
		}
	}

	return (
		<OverlayContainer onClick={() => setHighlightedTaskId(null)}>
			<ModalContent
				onClick={(e) => e.stopPropagation()}
				top={taskCardDimensions?.top}
				left={taskCardDimensions?.left}
				width={taskCardDimensions?.width}>
				<form onSubmit={handleTaskUpdateSubmit}>
					<TextAreaContainer isDark={settings.theme === 'dark'}>
						<TextAreaWrapper>
							<StyledTextArea
								isDark={settings.theme === 'dark'}
								ref={textareaRef}
								value={editTask}
								onChange={(e) => setEditTask(e.target.value)}
								onKeyDown={handleKeyDown}></StyledTextArea>
						</TextAreaWrapper>
					</TextAreaContainer>
					<SaveButton type="submit">Save</SaveButton>
				</form>
				{taskCardDimensions && (
					<div
						style={{
							position: 'fixed',
							top: taskCardDimensions?.top,
							left: taskCardDimensions?.left + taskCardDimensions?.width + 5,
						}}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
							}}>
							<ActionButton
								onClick={() => {
									setHighlightedTaskId(null)
									setEditTask('')
									toggleModal('viewTask', true)
								}}>
								<AiOutlinePlus size={15} color="#333" className="me-1" />
								Open card
							</ActionButton>
							<ActionButton ref={moveButtonRef} onClick={toggleMoveDiv}>
								<LuMoveRight size={14} color="#333" className="me-1" />
								Move
							</ActionButton>
							<ActionButton onClick={() => toggleModal('copyTask', true)}>
								<MdContentCopy size={14} color="#333" className="me-1" />
								Copy
							</ActionButton>
							<ActionButton onClick={removeTask}>
								<RiDeleteBinLine size={14} color="#333" className="me-1" />
								Delete
							</ActionButton>
							<MoveModal
								isVisible={isMoveDivVisible}
								toggleMoveDiv={toggleMoveDiv}
								moveButtonRef={moveButtonRef}
							/>
						</div>
					</div>
				)}
			</ModalContent>
		</OverlayContainer>
	)
}

export default Overlay
