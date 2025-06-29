import { KeyboardEvent, useEffect, useRef } from 'react'
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai'
import styled from 'styled-components'
import { useKanbanContext } from '../KanbanContext'
import { useThemeContext } from '@/common'

const FormContainer = styled.div<{ isVisible: boolean }>`
	display: ${(props) => (props.isVisible ? 'block' : 'none')};
	flex-shrink: 0;
	align-self: flex-start;
	padding: 0 6px;
`

const Form = styled.form<{ isDark: boolean }>`
	box-sizing: border-box;
	width: 272px;
	padding: 8px;
	border-radius: 12px;
	background: ${({ isDark }) => (isDark ? '#101204' : 'rgba(241, 242, 244)')};
`

const Textarea = styled.textarea<{ isDark: boolean }>`
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
	background: ${({ isDark }) => (isDark ? '#22272b' : 'rgba(241, 242, 244)')};
	&:focus {
		border: 2px solid #007bff;
	}
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

const CloseButton = styled.button<{ isDark: boolean }>`
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
		background: ${({ isDark }) =>
			isDark ? '#a6c5e229' : 'rgba(0, 0, 0, 0.1)'};
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

const ShowFormButton = styled.button<{ isDark: string }>`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	border: none;
	width: 272px;
	padding: 12px;
	border-radius: 12px;
	font-weight: 600;
	background: ${({ isDark }) => (isDark ? '#ffffff3d' : 'rgba(241, 242, 244)')};
	&:hover {
		background: rgb(255 255 255 / 20%);
	}
`

const AddListForm = () => {
	const { settings } = useThemeContext()
	const {
		handleAddList,
		openColumnStatus,
		setOpenColumnStatus,
		columnFormState,
		setColumnFormState,
	} = useKanbanContext()

	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const formRef = useRef<HTMLDivElement | null>(null)

	const handleShowForm = () => {
		if (openColumnStatus) {
			setOpenColumnStatus(null)
		}
		setColumnFormState((prevState) => ({ ...prevState, isFormVisible: true }))

		setTimeout(() => {
			textareaRef.current?.focus()
		}, 0)
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

	useEffect(() => {
		const handleClickOutside = () => {
			if (formRef.current && !formRef.current.contains(event?.target as Node)) {
				handleHideForm()
			}
		}

		document.addEventListener('mouseup', handleClickOutside)
		return () => {
			document.removeEventListener('mouseup', handleClickOutside)
		}
	}, [])

	return (
		<>
			<FormContainer isVisible={columnFormState.isFormVisible} ref={formRef}>
				<Form
					isDark={settings.theme === 'dark'}
					onSubmit={(e) => {
						e.preventDefault()
						handleAddList()
					}}>
					<Textarea
						ref={textareaRef}
						isDark={settings.theme === 'dark'}
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
							isDark={settings.theme === 'dark'}
							type="button"
							onClick={handleHideForm}
							aria-label="Close">
							<AiOutlineClose
								size={20}
								color={settings.theme === 'dark' ? '#b6c2cf' : '#333'}
							/>
						</CloseButton>
					</ButtonGroup>
				</Form>
			</FormContainer>

			<ShowFormContainer isVisible={columnFormState.isFormVisible}>
				<ShowFormButton onClick={handleShowForm} isDark={settings.theme}>
					<AiOutlinePlus
						size={15}
						color={settings.theme === 'dark' ? 'white' : '#333'}
						className="me-1"
					/>
					Add another list
				</ShowFormButton>
			</ShowFormContainer>
		</>
	)
}

export default AddListForm
