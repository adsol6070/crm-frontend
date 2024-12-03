import { KeyboardEvent } from 'react'
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai'
import styled from 'styled-components'
import { useKanbanContext } from '../KanbanContext'

const FormContainer = styled.div<{ isVisible: boolean }>`
	display: ${(props) => (props.isVisible ? 'block' : 'none')};
	flex-shrink: 0;
	align-self: flex-start;
	padding: 0 6px;
`

const Form = styled.form`
	box-sizing: border-box;
	width: 272px;
	padding: 8px;
	border-radius: 12px;
	background: rgba(241, 242, 244);
`

const Textarea = styled.textarea`
	height: 32px;
	width: 100%;
	min-height: 20px;
	max-height: 256px;
	margin: 0;
	padding: 6px 12px;
	overflow: hidden;
	border-radius: 4px;
	resize: none;
	font-weight: 600;
	overflow-wrap: break-word;
	outline: none;
`

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-top: 8px;
	border-radius: 4px;
	gap: 4px;
`

const AddButton = styled.button`
	line-height: 20px;
	background-color: #007bff;
	color: #ffffff;
	padding: 6px 12px;
	border: none;
	border-radius: 3px;
	font-weight: bold;
	cursor: pointer;
`

const CloseButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border: none;
	background-color: transparent;
	padding: 6px;
	box-shadow: none;
	border-radius: 3px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;

	&:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}
`

const ShowFormContainer = styled.div<{ isVisible: boolean }>`
	display: ${(props) => (props.isVisible ? 'none' : 'block')};
	flex-shrink: 0;
	align-self: flex-start;
	padding: 0 6px;
	flex-grow: 1;
	height: 100%;
`

const ShowFormButton = styled.button`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	border: none;
	width: 272px;
	padding: 12px;
	border-radius: 12px;
	background: rgba(241, 242, 244);
`

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
			<FormContainer isVisible={columnFormState.isFormVisible}>
				<Form
					onSubmit={(e) => {
						e.preventDefault()
						handleAddList()
					}}>
					<Textarea
						value={columnFormState.columnName}
						onChange={(event) =>
							setColumnFormState((prevState) => ({
								...prevState,
								columnName: event.target.value,
							}))
						}
						onKeyDown={handleKeyDownn}
						spellCheck="false"
						dir="auto"
						maxLength={512}
						autoComplete="off"
						placeholder="Enter list name..."></Textarea>
					<ButtonGroup>
						<AddButton type="submit">Add list</AddButton>
						<CloseButton
							type="button"
							onClick={handleHideForm}
							aria-label="Close">
							<AiOutlineClose size={20} color="#333" />
						</CloseButton>
					</ButtonGroup>
				</Form>
			</FormContainer>

			<ShowFormContainer isVisible={columnFormState.isFormVisible}>
				<ShowFormButton onClick={handleShowForm}>
					<AiOutlinePlus size={15} color="#333" className="me-1" />
					Add another list
				</ShowFormButton>
			</ShowFormContainer>
		</>
	)
}

export default AddListForm
