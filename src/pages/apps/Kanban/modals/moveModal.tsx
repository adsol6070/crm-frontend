import { MutableRefObject, useEffect, useState } from 'react'
import { BsStars } from 'react-icons/bs'
import { AiOutlineClose } from 'react-icons/ai'
import { FiArrowRight } from 'react-icons/fi'
import styled from 'styled-components'
import Select from 'react-select'
import { boardApi, taskApi } from '@/common'
import { useKanbanContext } from '../KanbanContext'

const MoveDiv = styled.section`
	position: fixed;
	background-color: #282e33;
	border-radius: 8px;
	font-size: 12px;
	width: 304px;
	z-index: 999;
`

const MoveDivHeader = styled.header`
	display: grid;
	position: relative;
	grid-template-columns: 32px 1fr 32px;
	align-items: center;
	padding: 4px 8px;
	text-align: center;
`

const MoveDivTitle = styled.h2`
	display: block;
	position: relative;
	grid-column: 1 / span 3;
	grid-row: 1;
	height: 40px;
	margin: 0;
	padding: 0 32px;
	overflow: hidden;
	color: #9fadbc;
	font-size: 14px;
	font-weight: 600;
	letter-spacing: -0.003em;
	line-height: 40px;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const CloseButton = styled.button`
	grid-column: 3;
	grid-row: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	color: #8c9bab;
	z-index: 2;
	margin: 0;
	padding: 0;
	border: none;
	outline: none;
	background: transparent;
	cursor: pointer;

	&:hover {
		background: #a6c5e229;
		color: #9fadbc;
	}
`

const MoveDivContent = styled.div`
	max-height: 614px;
	padding-top: 0;
	padding: 12px;
`

const SuggestedHeader = styled.h4`
	margin-top: 16px;
	color: #9fadbc;
	font-size: 12px;
	line-height: 16px;
	font-weight: 600;
	display: flex;
	align-items: center;
	column-gap: 4px;
	margin: 0 0 8px;
`

const Button = styled.button`
	justify-content: left;
	display: inline-flex;
	align-items: center;
	padding: 6px 12px;
	border-radius: 3px;
	text-decoration: none;
	border: none;
	background-color: #a1bdd914;
	color: #b6c2cf;
	font-size: 14px;

	&:hover {
		background-color: #a6c5e229;
	}
`

interface MoveModalInterface {
	isVisible: boolean
	toggleMoveDiv: () => void
	moveButtonRef: MutableRefObject<HTMLButtonElement | null>
}

const MoveModal = ({
	isVisible,
	toggleMoveDiv,
	moveButtonRef,
}: MoveModalInterface) => {
	const { boardId, selectedTask } = useKanbanContext()
	const [columns, setColumns] = useState([])
	const [suggestedColumns, setSuggestedColumns] = useState([])
	const [boards, setBoards] = useState([])
	const [selectedBoard, setSelectedBoard] = useState(null)
	const [selectedColumn, setSelectedColumn] = useState(null)
	const [selectedPosition, setSelectedPosition] = useState(null)
	const currentBoardId = selectedBoard?.value || boardId

	useEffect(() => {
		if (!isVisible) return
		const fetchData = async () => {
			try {
				const taskColumnResponse = await taskApi.getTaskColumn(currentBoardId)
				const taskColumns = taskColumnResponse?.[0]?.taskStatus || []

				const sortedColumns = taskColumns
					.sort((a, b) => a.order - b.order)
					.map(({ id, name, order }) => ({ value: id, label: name, order }))

				setColumns(sortedColumns)

				if (currentBoardId === boardId) {
					const currentColumn = taskColumns.find(
						(column) => column.id === selectedTask.columnId
					)

					if (currentColumn) {
						const suggestedColumns = taskColumns
							.filter((column) => column.order > currentColumn.order)
							.map(({ id, name, order }) => ({
								value: id,
								label: name,
								order,
							}))

						setSuggestedColumns(suggestedColumns)
					} else {
						setSuggestedColumns([])
					}
				}
			} catch (error) {
				console.error('Failed to fetch task columns:', error)
				setColumns([])
				setSuggestedColumns([])
			}

			try {
				const boardsResponse = await boardApi.getAllBoards()
				const boardOptions = boardsResponse.map(({ id, boardTitle }) => ({
					value: id,
					label: boardTitle,
				}))

				setBoards(boardOptions)
			} catch (error) {
				console.error('Failed to fetch boards:', error)
				setBoards([])
			}
		}

		fetchData()
	}, [isVisible, selectedTask.columnId, currentBoardId, boardId])

	if (!isVisible) return null

	return (
		<MoveDiv
			style={{
				top: moveButtonRef.current.getBoundingClientRect().top - 34,
				left: moveButtonRef.current.getBoundingClientRect().left,
			}}>
			<MoveDivHeader>
				<MoveDivTitle>Move card</MoveDivTitle>
				<CloseButton onClick={toggleMoveDiv}>
					<AiOutlineClose color="#8c9bab" size={16} />
				</CloseButton>
			</MoveDivHeader>
			<MoveDivContent>
				<div>
					<div style={{ marginTop: '12px' }}>
						<SuggestedHeader>
							<BsStars />
							Suggested
						</SuggestedHeader>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								rowGap: '8px',
							}}>
							{suggestedColumns
								.sort((a, b) => a.order - b.order)
								.slice(0, 3)
								.map((suggestedColumn) => (
									<Button key={suggestedColumn.value}>
										<FiArrowRight size={20} />
										<div style={{ marginLeft: '8px' }}>
											{suggestedColumn.label}
										</div>
									</Button>
								))}
						</div>
					</div>
					<div style={{ marginTop: '12px' }}>
						<h4
							style={{
								marginTop: '16px',
								color: '#9FADBC',
								fontSize: '12px',
								lineHeight: '16px',
								fontWeight: 600,
								margin: '0 0 8px',
							}}>
							Select destination
						</h4>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								width: '100%',
								gap: '8px',
							}}>
							<div style={{ flex: '1 1 100%' }}>
								<label
									style={{
										color: '#B6C2CF',
										fontWeight: 'bold',
										fontSize: '14px',
									}}>
									Board
								</label>
								<Select
									styles={{
										control: (provided) => ({
											...provided,
											backgroundColor: '#22272b',
											border: '1px solid #738496',
											borderRadius: '4px',
										}),
										placeholder: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isFocused
												? '#a6c5e229'
												: '#22272B',
											color: '#9fadbc',
											cursor: 'pointer',
										}),
										input: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
										dropdownIndicator: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
									}}
									options={boards}
									onChange={(selectedOption) =>
										setSelectedBoard(selectedOption)
									}
								/>
							</div>

							<div style={{ flex: '2.5' }}>
								<label
									style={{
										color: '#9fadbc',
										fontWeight: 'bold',
										fontSize: '14px',
									}}>
									List
								</label>
								<Select
									styles={{
										control: (provided) => ({
											...provided,
											backgroundColor: '#22272B',
											border: '1px solid #738496',
											borderRadius: '4px',
										}),
										placeholder: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isFocused
												? '#a6c5e229'
												: '#22272B',
											color: '#9fadbc',
											cursor: 'pointer',
										}),
										input: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
										dropdownIndicator: (provided) => ({
											...provided,
											color: '#9fadbc',
										}),
									}}
									options={columns}
									onChange={(selectedOption) =>
										setSelectedColumn(selectedOption)
									}
								/>
							</div>

							<div style={{ flex: '1' }}>
								<label
									style={{
										color: '#B6C2CF',
										fontWeight: 'bold',
										fontSize: '14px',
									}}>
									Position
								</label>
								<Select
									styles={{
										control: (provided) => ({
											...provided,
											backgroundColor: '#22272B',
											border: '1px solid #738496',
											borderRadius: '4px',
										}),
										placeholder: (provided) => ({
											...provided,
											color: '#B6C2CF',
										}),
										option: (provided, state) => ({
											...provided,
											backgroundColor: state.isFocused
												? '#a6c5e229'
												: '#22272B',
											color: '#B6C2CF',
											cursor: 'pointer',
										}),
										input: (provided) => ({
											...provided,
											color: '#B6C2CF',
										}),
										dropdownIndicator: (provided) => ({
											...provided,
											color: '#B6C2CF',
										}),
									}}
									options={[
										{ value: 'option1', label: 'Option 1' },
										{ value: 'option2', label: 'Option 2' },
										{ value: 'option3', label: 'Option 3' },
										{ value: 'option4', label: 'Option 4' },
										{ value: 'option5', label: 'Option 5' },
									]}
									onChange={(selectedOption) =>
										setSelectedPosition(selectedOption)
									}
								/>
							</div>
						</div>

						<button
							style={{
								margin: '8px 0 0',
								padding: '6px 24px',
								border: 'none',
								background: '#579DFF',
								boxShadow: 'none',
								color: '#1D2125',
								borderRadius: '3px',
								fontSize: '14px',
								fontWeight: 600,
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = '#85B8FF'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = '#579DFF'
							}}>
							Move
						</button>
					</div>
				</div>
			</MoveDivContent>
		</MoveDiv>
	)
}

export default MoveModal
