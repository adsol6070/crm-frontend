import { KeyboardEvent } from 'react'
import { useKanbanContext } from '../KanbanContext'
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai'

const styles = {
	formContainer: {
		boxSizing: 'border-box',
		width: '272px',
		padding: '8px',
		borderRadius: '12px',
		background: 'rgba(241, 242, 244)',
	},
	textarea: {
		height: '32px',
		width: '100%',
		minHeight: '20px',
		maxHeight: '256px',
		margin: '0px',
		padding: '6px 12px',
		overflow: 'hidden',
		borderRadius: '4px',
		resize: 'none',
		fontWeight: 600,
		overflowWrap: 'break-word',
		outline: 'none',
	},
	closeButton: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxSizing: 'border-box',
		border: 'none',
		backgroundColor: 'transparent',
		padding: '6px',
		boxShadow: 'none',
		borderRadius: '3px',
		cursor: 'pointer',
		transition: 'all 0.2s ease-in-out',
	},
}

const AddListForm = () => {
	const {
		handleAddList,
		openColumnStatus,
		setOpenColumnStatus,
		columnFormState,
		setColumnFormState,
	} = useKanbanContext()

	const handleShowForm = () => {
		if (openColumnStatus) {
			setOpenColumnStatus(null)
		}
		setColumnFormState((prevState) => ({ ...prevState, isFormVisible: true }))
	}

	const handleHideForm = () => {
		setColumnFormState({
			columnName: '',
			isFormVisible: false,
		})
	}

	const handleKeyDownn = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			await handleAddList()
		}
	}

	return (
		<>
			<div
				style={{
					display: columnFormState.isFormVisible ? 'block' : 'none',
					flexShrink: 0,
					alignSelf: 'flex-start',
					padding: '0 6px',
				}}>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						handleAddList()
					}}
					style={styles.formContainer}>
					<textarea
						value={columnFormState.columnName}
						onChange={(event) =>
							setColumnFormState((prevState) => ({
								...prevState,
								columnName: event.target.value,
							}))
						}
						onKeyDown={handleKeyDownn}
						style={styles.textarea}
						spellCheck="false"
						dir="auto"
						maxLength={512}
						autoComplete="off"
						placeholder="Enter list name..."></textarea>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							marginTop: '8px',
							borderRadius: '4px',
							gap: '4px',
						}}>
						<button
							type="submit"
							style={{
								lineHeight: '20px',
								backgroundColor: '#007BFF',
								color: '#FFFFFF',
								padding: '6px 12px',
								border: 'none',
								borderRadius: '3px',
								fontWeight: 'bold',
								cursor: 'pointer',
							}}>
							Add list
						</button>
						<button
							type="button"
							onClick={handleHideForm}
							style={styles.closeButton}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent'
							}}
							aria-label="Close">
							<AiOutlineClose size={20} color="#333" />
						</button>
					</div>
				</form>
			</div>

			<div
				style={{
					display: columnFormState.isFormVisible ? 'none' : 'block',
					flexShrink: 0,
					alignSelf: 'flex-start',
					padding: '0 6px',
					flexGrow: 1,
					height: '100%',
				}}>
				<button
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						border: 'none',
						width: '272px',
						padding: '12px',
						borderRadius: '12px',
						background: 'rgba(241, 242, 244)',
					}}
					onClick={handleShowForm}>
					<AiOutlinePlus size={15} color="#333" className="me-1" />
					Add another list
				</button>
			</div>
		</>
	)
}

export default AddListForm
