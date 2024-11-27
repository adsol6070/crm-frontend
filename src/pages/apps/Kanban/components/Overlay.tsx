import { FormEvent, KeyboardEvent, useRef, useState } from 'react'
import { useKanbanContext } from '../KanbanContext'
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai'
import { LuMoveRight } from 'react-icons/lu'
import { BsStars } from 'react-icons/bs'
import { FiArrowRight } from 'react-icons/fi'
import { MdContentCopy } from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'
import Select from 'react-select'

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
	} = useKanbanContext()

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

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				background: '#00000099',
				zIndex: 11,
			}}
			onClick={() => setHighlightedTaskId(null)}>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					position: 'fixed',
					top: taskCardDimensions?.top,
					left: taskCardDimensions?.left,
					width: taskCardDimensions?.width,
					zIndex: 999999999,
				}}>
				<form onSubmit={handleTaskUpdateSubmit}>
					<div
						style={{
							position: 'relative',
							minHeight: '36px',
							borderRadius: '8px',
							backgroundColor: '#ffffff',
							color: '#B6C2CF',
							cursor: 'pointer',
							scrollMargin: '8px',
						}}>
						<div
							style={{
								display: 'flow-root',
								position: 'relative',
								zIndex: 10,
								minHeight: '24px',
								padding: '8px 12px 4px',
							}}>
							<textarea
								ref={textareaRef}
								value={editTask}
								onChange={(e) => setEditTask(e.target.value)}
								onKeyDown={handleKeyDown}
								style={{
									height: '56px',
									backgroundColor: 'unset',
									marginBottom: '4px',
									padding: 0,
									overflow: 'hidden',
									overflowWrap: 'break-word',
									resize: 'none',
									width: '100%',
									border: 'none',
									borderRadius: '3px',
									boxSizing: 'border-box',
									display: 'block',
									lineHeight: '20px',
									outline: 'none',
									fontSize: '14px',
									fontWeight: 400,
								}}></textarea>
						</div>
					</div>
					<button
						type="submit"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxSizing: 'border-box',
							border: 'none',
							backgroundColor: '#579DFF',
							color: '#1D2125',
							marginTop: '8px',
							marginBottom: 0,
							padding: '6px 12px',
							borderRadius: '3px',
							textDecoration: 'none',
							whiteSpace: 'normal',
							cursor: 'pointer',
							fontWeight: 500,
						}}>
						Save
					</button>
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
							<button
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									border: 'none',
									margin: '0px',
									padding: '6px 12px 6px 10px',
									borderRadius: '3px',
									textDecoration: 'none',
									userSelect: 'none',
									fontSize: '14px',
									lineHeight: '20px',
									marginBottom: '4px',
									fontWeight: 500,
								}}
								onClick={() => {
									setHighlightedTaskId(null)
									setEditTask('')
									toggleModal('viewTask', true)
								}}>
								<AiOutlinePlus size={15} color="#333" className="me-1" />
								Open card
							</button>
							<button
								ref={moveButtonRef}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									border: 'none',
									margin: '0px',
									padding: '6px 12px 6px 10px',
									borderRadius: '3px',
									textDecoration: 'none',
									userSelect: 'none',
									fontSize: '14px',
									lineHeight: '20px',
									fontWeight: 500,
									marginBottom: '4px',
								}}
								onClick={() => {
									toggleMoveDiv() // Toggle visibility of the div above the button
									// toggleModal('moveTask', true);
								}}>
								<LuMoveRight size={14} color="#333" className="me-1" />
								Move
							</button>

							{isMoveDivVisible && moveButtonRef.current && (
								<section
									style={{
										position: 'fixed',
										top: moveButtonRef.current.getBoundingClientRect().top - 34,
										left: moveButtonRef.current.getBoundingClientRect().left,
										backgroundColor: '#445461',
										borderRadius: '8px',
										fontSize: '12px',
										width: '304px',
										zIndex: 999,
									}}>
									<header
										style={{
											display: 'grid',
											position: 'relative',
											gridTemplateColumns: '32px 1fr 32px',
											alignItems: 'center',
											padding: '4px 8px',
											textAlign: 'center',
										}}>
										<h2
											style={{
												display: 'block',
												position: 'relative',
												gridColumn: '1 / span 3',
												gridRow: '1',
												height: '40px',
												margin: 0,
												padding: '0 32px',
												overflow: 'hidden',
												color: '#9FADBC',
												fontSize: '14px',
												fontWeight: 600,
												letterSpacing: '-0.003em',
												lineHeight: '40px',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}>
											Move card
										</h2>
										<button
											style={{
												gridColumn: 3,
												gridRow: 1,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: '32px',
												height: '32px',
												borderRadius: '8px',
												color: '#8C9BAB',
												zIndex: 2,
												margin: 0,
												padding: 0,
												border: 'none',
												outline: 'none',
												background: 'transparent',
												cursor: 'pointer',
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = '#a6c5e229'
												e.currentTarget.style.color = '#9FADBC'
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = 'transparent'
												e.currentTarget.style.color = '#8C9BAB'
											}}>
											<AiOutlineClose color="#8c9bab" size={16} />
										</button>
									</header>
									<div
										style={{
											maxHeight: '614px',
											paddingTop: 0,
											padding: '12px',
										}}>
										<div>
											<div style={{ marginTop: '12px' }}>
												<h4
													style={{
														marginTop: '16px',
														color: '#9FADBC',
														fontSize: '12px',
														lineHeight: '16px',
														fontWeight: 600,
														display: 'flex',
														alignItems: 'center',
														columnGap: '4px',
														margin: '0 0 8px',
													}}>
													<BsStars />
													Suggested
												</h4>
												<div
													style={{
														display: 'flex',
														flexDirection: 'column',
														rowGap: '8px',
													}}>
													<button
														style={{
															justifyContent: 'left',
															display: 'inline-flex',
															alignItems: 'center',
															padding: '6px 12px',
															borderRadius: '3px',
															textDecoration: 'none',
															border: 'none',
															backgroundColor: '#a1bdd914',
															color: '#B6C2CF',
															fontSize: '14px',
														}}>
														<FiArrowRight size={20} />
														<div style={{ marginLeft: '8px' }}>InProgress</div>
													</button>
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
													}}>
													<div
														style={{
															flex: '1 1 100%',
															maxWidth: '100%',
															margin: '0 0 8px',
														}}>
														<div>
															<label
																style={{
																	color: '#B6C2CF',
																	fontWeight: 700,
																	marginTop: '12px',
																	fontSize: '14px',
																	lineHeight: '20px',
																}}>
																Board
															</label>
															<div
																style={{
																	pointerEvents: 'all',
																	position: 'relative',
																	boxSizing: 'border-box',
																}}>
																<div
																	style={{
																		cursor: 'default',
																		display: 'flex',
																		flexWrap: 'wrap',
																		alignItems: 'center',
																		justifyContent: 'space-between',
																		minHeight: '40px',
																		position: 'relative',
																		backgroundColor: '#22272B',
																		borderColor: '#738496',
																		borderRadius: '3px',
																		borderStyle: 'solid',
																		borderWidth: '1px',
																		padding: 0,
																		outline: '0px !important',
																	}}>
																	<div
																		style={{
																			display: 'grid',
																			alignItems: 'center',
																			flex: '1 1 0%',
																			position: 'relative',
																		}}>
																		<div
																			style={{
																				gridArea: '1 / 1 / 2 / 3',
																				maxWidth: '100%',
																			}}>
																			<Select
																				styles={{
																					control: (provided: any) => ({
																						...provided,
																						backgroundColor: 'transparent',
																						border: 'none',
																					}),
																					placeholder: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					option: (
																						provided: any,
																						state: any
																					) => ({
																						...provided,
																						background: '#22272B',
																						cursor: 'pointer',
																						'&:hover': {
																							backgroundColor: '#a6c5e229',
																						},
																					}),
																					input: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					dropdownIndicator: (
																						provided: any
																					) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																				}}
																				options={[
																					{
																						value: 'option1',
																						label: 'Option 1',
																					},
																					{
																						value: 'option2',
																						label: 'Option 2',
																					},
																					{
																						value: 'option3',
																						label: 'Option 3',
																					},
																					{
																						value: 'option4',
																						label: 'Option 4',
																					},
																					{
																						value: 'option5',
																						label: 'Option 5',
																					},
																				]}
																			/>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div
														style={{
															flex: '2.5',
															maxWidth: '100%',
															margin: '0 8px 8px 0',
														}}>
														<div>
															<label
																style={{
																	color: '#B6C2CF',
																	fontWeight: 700,
																	marginTop: '12px',
																	fontSize: '14px',
																	lineHeight: '20px',
																}}>
																List
															</label>
															<div
																style={{
																	pointerEvents: 'all',
																	position: 'relative',
																	boxSizing: 'border-box',
																}}>
																<div
																	style={{
																		cursor: 'default',
																		display: 'flex',
																		flexWrap: 'wrap',
																		alignItems: 'center',
																		justifyContent: 'space-between',
																		minHeight: '40px',
																		position: 'relative',
																		backgroundColor: '#22272B',
																		borderColor: '#738496',
																		borderRadius: '3px',
																		borderStyle: 'solid',
																		borderWidth: '1px',
																		padding: 0,
																		outline: '0px !important',
																	}}>
																	<div
																		style={{
																			display: 'grid',
																			alignItems: 'center',
																			flex: '1 1 0%',
																			position: 'relative',
																		}}>
																		<div
																			style={{
																				gridArea: '1 / 1 / 2 / 3',
																				maxWidth: '100%',
																			}}>
																			<Select
																				styles={{
																					control: (provided: any) => ({
																						...provided,
																						backgroundColor: 'transparent',
																						border: 'none',
																					}),
																					placeholder: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					option: (
																						provided: any,
																						state: any
																					) => ({
																						...provided,
																						background: '#22272B',
																						cursor: 'pointer',
																						'&:hover': {
																							backgroundColor: '#a6c5e229',
																						},
																					}),
																					input: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					dropdownIndicator: (
																						provided: any
																					) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																				}}
																				options={[
																					{
																						value: 'option1',
																						label: 'Option 1',
																					},
																					{
																						value: 'option2',
																						label: 'Option 2',
																					},
																					{
																						value: 'option3',
																						label: 'Option 3',
																					},
																					{
																						value: 'option4',
																						label: 'Option 4',
																					},
																					{
																						value: 'option5',
																						label: 'Option 5',
																					},
																				]}
																				getOptionLabel={(e: any) => e.label}
																				getOptionValue={(e: any) => e.value}
																			/>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div
														style={{
															flex: '1',
															maxWidth: '100%',
															margin: '0 0 8px',
														}}>
														<div>
															<label
																style={{
																	color: '#B6C2CF',
																	fontWeight: 700,
																	marginTop: '12px',
																	fontSize: '14px',
																	lineHeight: '20px',
																}}>
																Position
															</label>
															<div
																style={{
																	pointerEvents: 'all',
																	position: 'relative',
																	boxSizing: 'border-box',
																}}>
																<div
																	style={{
																		cursor: 'default',
																		display: 'flex',
																		flexWrap: 'wrap',
																		alignItems: 'center',
																		justifyContent: 'space-between',
																		minHeight: '40px',
																		position: 'relative',
																		backgroundColor: '#22272B',
																		borderColor: '#738496',
																		borderRadius: '3px',
																		borderStyle: 'solid',
																		borderWidth: '1px',
																		padding: 0,
																		outline: '0px !important',
																	}}>
																	<div
																		style={{
																			display: 'grid',
																			alignItems: 'center',
																			flex: '1 1 0%',
																			position: 'relative',
																			boxSizing: 'border-box',
																		}}>
																		<div
																			style={{
																				gridArea: '1 / 1 / 2 / 3',
																				maxWidth: '100%',
																				textOverflow: 'ellipsis',
																				whiteSpace: 'nowrap',
																			}}>
																			<Select
																				styles={{
																					control: (provided: any) => ({
																						...provided,
																						backgroundColor: 'transparent',
																						border: 'none',
																					}),
																					placeholder: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					option: (
																						provided: any,
																						state: any
																					) => ({
																						...provided,
																						background: '#22272B',
																						cursor: 'pointer',
																						'&:hover': {
																							backgroundColor: '#a6c5e229',
																						},
																					}),
																					input: (provided: any) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																					dropdownIndicator: (
																						provided: any
																					) => ({
																						...provided,
																						color: '#B6C2CF',
																					}),
																				}}
																				options={[
																					{
																						value: 'option1',
																						label: 'Option 1',
																					},
																					{
																						value: 'option2',
																						label: 'Option 2',
																					},
																					{
																						value: 'option3',
																						label: 'Option 3',
																					},
																					{
																						value: 'option4',
																						label: 'Option 4',
																					},
																					{
																						value: 'option5',
																						label: 'Option 5',
																					},
																				]}
																			/>
																		</div>
																	</div>
																</div>
															</div>
														</div>
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
													}}>
													Move
												</button>
											</div>
										</div>
									</div>
								</section>
							)}
							<button
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									border: 'none',
									margin: '0px',
									padding: '6px 12px 6px 10px',
									borderRadius: '3px',
									textDecoration: 'none',
									userSelect: 'none',
									fontSize: '14px',
									lineHeight: '20px',
									fontWeight: 500,
									marginBottom: '4px',
								}}
								onClick={() => toggleModal('copyTask', true)}>
								<MdContentCopy size={14} color="#333" className="me-1" />
								Copy
							</button>
							<button
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									border: 'none',
									margin: '0px',
									padding: '6px 12px 6px 10px',
									borderRadius: '3px',
									textDecoration: 'none',
									userSelect: 'none',
									fontSize: '14px',
									lineHeight: '20px',
									fontWeight: 500,
									marginBottom: '4px',
								}}
								onClick={removeTask}>
								<RiDeleteBinLine size={14} color="#333" className="me-1" />
								Delete
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Overlay
