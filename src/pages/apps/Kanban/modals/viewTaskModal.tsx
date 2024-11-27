import { useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { MdOutlineSubject } from 'react-icons/md'
import { RxActivityLog } from 'react-icons/rx'
import { FaCreditCard } from 'react-icons/fa'
import { BsPersonAdd } from 'react-icons/bs'
import { IoPersonOutline } from 'react-icons/io5'
import { IoMdCheckboxOutline } from 'react-icons/io'
import { SlClock } from 'react-icons/sl'
import { GrAttachment } from 'react-icons/gr'
import { MdLocationOn } from 'react-icons/md'
import { FiCreditCard } from 'react-icons/fi'
import { HiOutlineEye } from 'react-icons/hi'
import { TiTag } from 'react-icons/ti'
import { useKanbanContext } from '../KanbanContext'
import './modalLoader.css'

interface CardType {
	id?: number
	title?: string
	description?: string
	status?: string
	createdAt?: string
}

interface ViewTaskModalProps {
	show: boolean
	onHide: () => void
	task: CardType
	handleStatusChange: (status: string) => void
	updateTask: (taskId: string, data: any) => void
}

const ViewTaskModal = ({
	show,
	onHide,
	task,
	handleStatusChange,
	updateTask,
}: ViewTaskModalProps) => {
	const { setSelectedTask } = useKanbanContext()
	const [loading, setLoading] = useState(true)
	const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] =
		useState<boolean>(false)

	useEffect(() => {
		if (show) {
			setLoading(true)
			const timer = setTimeout(() => {
				setLoading(false)
			}, 1000)

			return () => clearTimeout(timer)
		}
	}, [show])

	if (!show) return null

	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.currentTarget === event.target) {
			onHide()
			setIsDescriptionEditorVisible(false)
			setSelectedTask({})
		}
	}

	return (
		<div
			style={{
				zIndex: '2000',
				position: 'fixed',
				top: 0,
				left: 0,
				outline: 'none',
			}}>
			<div
				style={{
					alignItems: 'flex-start',
					width: '100vw',
					height: '100vh',
					display: 'flex',
					position: 'fixed',
					boxSizing: 'border-box',
					justifyContent: 'center',
					overflow: 'auto',
					background: 'rgb(0 0 0 / 75%)',
					scrollbarGutter: 'stable',
				}}
				onClick={handleBackdropClick}>
				<div
					style={{
						position: 'relative',
						width: 'auto',
						margin: '48px 0',
						background: 'transparent',
					}}>
					<div
						style={{
							width: '768px',
							position: 'relative',
							boxSizing: 'border-box',
							borderRadius: '12px',
							backgroundColor: loading ? '#282E33' : '#323940',
						}}>
						<div>
							{loading ? (
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										height: '600px',
										borderRadius: '12px',
									}}>
									<div className="loader"></div>
								</div>
							) : (
								<>
									<button
										style={{
											position: 'absolute',
											zIndex: 1,
											top: '8px',
											right: '8px',
											borderRadius: '50%',
											padding: '8px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											backgroundColor: 'transparent',
											border: 'none',
											cursor: 'pointer',
											transition: 'background-color 0.1s ease',
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.backgroundColor = '#a6c5e229')
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = 'transparent')
										}
										onClick={() => {
											setSelectedTask({})
											onHide()
										}}>
										<AiOutlineClose
											style={{ color: '#B6C2CF', fontSize: '20px' }}
										/>
									</button>
									<div style={{ minHeight: '600px', borderRadius: '12px' }}>
										<div style={{ padding: '16px 52px 0 16px' }}>
											<section
												style={{
													display: 'grid',
													marginBottom: '12px',
													gridTemplateColumns:
														'[icon] 40px [body] minmax(0, 1fr)',
												}}>
												<div style={{ gridColumn: 'icon' }}>
													<span
														style={{
															display: 'inline-block',
															boxSizing: 'border-box',
															padding: '4px',
														}}>
														<span
															style={{
																overflow: 'hidden',
																pointerEvents: 'none',
																maxWidth: '100%',
																maxHeight: '100%',
															}}>
															<FaCreditCard
																style={{ color: '#9FADBC', fontSize: '18px' }}
															/>
														</span>
													</span>
												</div>
												<hgroup
													style={{
														gridColumn: 'body',
														display: 'flex',
														flexWrap: 'wrap',
														alignItems: 'center',
														justifyContent: 'space-between',
														columnGap: '8px',
														rowGap: '2px',
													}}>
													<h2
														style={{
															fontSize: '20px',
															fontWeight: 600,
															lineHeight: '24px',
															color: '#b6c2cf',
														}}>
														Project Planning
													</h2>
													<textarea
														dir="auto"
														maxLength={16384}
														style={{
															height: '36px',
															display: 'none',
															boxSizing: 'border-box',
															width: '100%',
															margin: '-6px -10px',
															padding: '6px 10px',
															transform: 'translate3d(0, 0, 0)',
															border: 'none',
															borderRadius: '4px',
															outline: 'none',
															fontSize: '20px',
															fontWeight: 600,
															lineHeight: '24px',
															resize: 'none',
														}}></textarea>
												</hgroup>
												<div style={{ gridColumn: 'body' }}>
													<p
														style={{
															display: 'flex',
															flexWrap: 'wrap',
															alignItems: 'center',
															marginTop: '4px',
															marginBottom: 0,
															columnGap: '4px',
															color: '#9FADBC',
															margin: '0 0 8px',
														}}>
														in list
														<button
															style={{
																display: 'inline-flex',
																position: 'relative',
																boxSizing: 'border-box',
																marginBottom: 0,
																padding: 0,
																border: 'none',
																borderRadius: '3px',
																lineHeight: '20px',
																textDecoration: 'none',
																background: 'transparent',
															}}>
															<span
																style={{
																	maxWidth: '100%',
																	boxSizing: 'border-box',
																	appearance: 'none',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	paddingInline: '4px',
																	display: 'inline-flex',
																	borderRadius: '3px',
																	blockSize: 'min-content',
																	position: 'static',
																	overflow: 'hidden',
																}}>
																<span
																	style={{
																		maxWidth: 'calc(400px - 0.5rem, 8px)',
																	}}>
																	<span
																		style={{
																			display: 'flex',
																			alignItems: 'center',
																		}}>
																		<span
																			style={{
																				maxWidth: '380px',
																				overflow: 'hidden',
																				textOverflow: 'ellipsis',
																				whiteSpace: 'nowrap',
																				fontSize: '11px',
																				fontStyle: 'normal',
																				textTransform: 'uppercase',
																				lineHeight: '16px',
																				color: '#9FADBC',
																			}}>
																			Todo
																		</span>
																	</span>
																</span>
															</span>
														</button>
													</p>
												</div>
											</section>
										</div>
										<div
											style={{
												display: 'grid',
												gridTemplateColumns:
													'[main] 568px [sidebar] minmax(0, 1fr)',
												gridTemplateRows: 'auto auto',
												columnGap: '16px',
												rowGap: '8px',
											}}>
											<div
												style={{
													gridColumnStart: 'main',
													paddingBottom: '8px',
													paddingLeft: '16px',
												}}>
												<div
													style={{
														marginBottom: '16px',
														display: 'flex',
														flexWrap: 'wrap',
														paddingLeft: '40px',
														columnGap: '8px',
														rowGap: '8px',
													}}>
													<section
														style={{
															display: 'flex',
															flexDirection: 'column',
															justifyContent: 'flex-end',
															maxWidth: '100%',
														}}>
														<h3
															style={{
																fontSize: '12px',
																fontWeight: 600,
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
																marginTop: 0,
																marginBottom: '4px',
																lineHeight: '20px',
																color: '#b6c2cf',
															}}>
															Notifications
														</h3>
														<div>
															<button
																style={{
																	border: 'none',
																	backgroundColor: '#a6c5e229',
																	boxShadow: 'none',
																	color: '#B6C2CF',
																	textDecoration: 'none',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	justifyContent: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	fontWeight: '500',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<HiOutlineEye style={{ marginRight: '8px' }} />
																Watch
															</button>
														</div>
													</section>
												</div>
												<section
													style={{
														display: 'grid',
														gridTemplateColumns:
															'[icon] 40px [body] minmax(0, 1fr)',
														rowGap: '12px',
														marginBottom: '24px',
													}}>
													<div style={{ gridColumnStart: 'icon' }}>
														<span
															style={{
																display: 'inline-block',
																boxSizing: 'border-box',
																padding: '4px',
															}}>
															<span
																style={{
																	overflow: 'hidden',
																	pointerEvents: 'none',
																	maxWidth: '100%',
																	maxHeight: '100%',
																}}>
																<MdOutlineSubject
																	style={{ color: '#9FADBC', fontSize: '26px' }}
																/>
															</span>
														</span>
													</div>
													<hgroup
														style={{
															display: 'flex',
															flexWrap: 'wrap',
															alignItems: 'center',
															justifyContent: 'space-between',
															columnGap: '8px',
															rowGap: '2px',
														}}>
														<div
															style={{
																display: 'flex',
																flexGrow: 1,
																alignItems: 'center',
																columnGap: '8px',
															}}>
															<h3
																style={{
																	fontSize: '16px',
																	lineHeight: '20px',
																	marginBottom: 0,
																	fontWeight: 600,
																	color: '#b6c2cf',
																}}>
																Description
															</h3>
														</div>
														<div></div>
													</hgroup>
													<div
														style={{
															gridColumnStart: 'body',
															wordBreak: 'break-word',
														}}>
														<button
															style={{
																display: isDescriptionEditorVisible
																	? 'none'
																	: 'block',
																boxSizing: 'border-box',
																width: '100%',
																margin: 0,
																padding: '8px 12px 32px',
																borderRadius: '3px',
																backgroundColor: '#a1bdd914',
																color: '#B6C2CF',
																fontWeight: 500,
																textAlign: 'left',
																border: 'none',
																fontSize: '14px',
															}}
															onMouseEnter={(e) =>
																(e.currentTarget.style.backgroundColor =
																	'#a6c5e229')
															}
															onMouseLeave={(e) =>
																(e.currentTarget.style.background = '#a1bdd914')
															}
															onClick={() =>
																setIsDescriptionEditorVisible(true)
															}>
															Add a more detailed description...
														</button>

														<div
															style={{
																display: isDescriptionEditorVisible
																	? 'block'
																	: 'none',
															}}>
															<div>
																<div
																	style={{
																		padding: '2px',
																		border: 'none',
																		display: 'flex',
																		flexDirection: 'column',
																		minWidth: '272px',
																		height: 'auto',
																		backgroundColor: '#22272B',
																		boxSizing: 'border-box',
																		borderRadius: '3px',
																		overflowWrap: 'break-word',
																		minHeight: '275px',
																	}}>
																	<textarea
																		placeholder="Write description here..."
																		style={{
																			flex: 1,
																			border: 'none',
																			outline: 'none',
																			resize: 'none',
																			padding: '6px 8px 6px 12px',
																			background: 'transparent',
																			overflow: 'hidden',
																			borderRadius: '8px',
																			boxSizing: 'border-box',
																			color: '#b6c2cf',
																		}}></textarea>
																</div>
																<div
																	style={{
																		display: 'flex',
																		marginTop: '8px',
																		columnGap: '8px',
																	}}>
																	<button
																		style={{
																			border: 'none',
																			backgroundColor: '#579DFF',
																			boxShadow: 'none',
																			color: '#1D2125',
																			fontSize: '14px',
																			lineHeight: '20px',
																			display: 'inline-flex',
																			boxSizing: 'border-box',
																			alignItems: 'center',
																			justifyContent: 'center',
																			padding: '6px 12px',
																			borderRadius: '3px',
																			textDecoration: 'none',
																			whiteSpace: 'normal',
																			cursor: 'pointer',
																			fontWeight: '600',
																		}}>
																		Save
																	</button>
																	<button
																		style={{
																			border: 'none',
																			backgroundColor: 'transparent',
																			boxShadow: 'none',
																			fontSize: '14px',
																			lineHeight: '20px',
																			display: 'inline-flex',
																			boxSizing: 'border-box',
																			alignItems: 'center',
																			justifyContent: 'center',
																			padding: '6px 12px',
																			borderRadius: '3px',
																			textDecoration: 'none',
																			whiteSpace: 'normal',
																			cursor: 'pointer',
																			color: '#B6C2CF',
																			fontWeight: 600,
																		}}
																		onMouseEnter={(e) =>
																			(e.currentTarget.style.backgroundColor =
																				'#a6c5e229')
																		}
																		onMouseLeave={(e) =>
																			(e.currentTarget.style.background =
																				'transparent')
																		}
																		onClick={() =>
																			setIsDescriptionEditorVisible(false)
																		}>
																		Cancel
																	</button>
																</div>
															</div>
														</div>
													</div>
												</section>
												<section
													style={{
														display: 'grid',
														gridTemplateColumns:
															'[icon] 40px [body] minmax(0, 1fr)',
														rowGap: '12px',
														marginBottom: '24px',
													}}>
													<div style={{ gridColumnStart: 'icon' }}>
														<span
															style={{
																display: 'inline-block',
																boxSizing: 'border-box',
																padding: '4px',
															}}>
															<span
																style={{
																	overflow: 'hidden',
																	pointerEvents: 'none',
																	maxWidth: '100%',
																	maxHeight: '100%',
																}}>
																<RxActivityLog
																	fontWeight={'bold'}
																	style={{ color: '#9FADBC', fontSize: '18px' }}
																/>
															</span>
														</span>
													</div>
													<hgroup
														style={{
															display: 'flex',
															flexWrap: 'wrap',
															alignItems: 'center',
															justifyContent: 'space-between',
															columnGap: '8px',
															rowGap: '2px',
														}}>
														<h3
															style={{
																fontSize: '16px',
																lineHeight: '20px',
																marginBottom: 0,
																fontWeight: 600,
																color: '#b6c2cf',
															}}>
															Activity
														</h3>
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																marginLeft: 'auto',
																gap: '8px',
															}}>
															<div
																style={{
																	alignContent: 'center',
																	lineHeight: 0,
																}}>
																<div
																	style={{
																		display: 'inline-flex',
																		gap: '4px',
																	}}></div>
															</div>
															<button
																style={{
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	justifyContent: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	color: '#b6c2cf',
																	backgroundColor: '#a1bdd914',
																	fontWeight: 600,
																}}>
																Show Details
															</button>
														</div>
													</hgroup>
													<div
														style={{
															display: 'grid',
															gridColumn: '1 / -1',
															gridTemplateColumns: 'subgrid',
														}}>
														<div
															style={{
																display: 'grid',
																gridColumn: '1 / -1',
																gridTemplateColumns: 'subgrid',
																marginBottom: '8px',
															}}>
															<div
																style={{
																	position: 'relative',
																	overflow: 'visible',
																	lineHeight: '10px',
																	verticalAlign: 'top',
																	whiteSpace: 'nowrap',
																}}
																title="sagguharman11 (sagguharman11)"></div>
															<div>
																<div aria-live="polite" role="region"></div>
																<div>
																	<input
																		type="text"
																		placeholder="Write a comment..."
																		style={{
																			width: '100%',
																			borderRadius: '8px',
																			border: 'none',
																			outline: 'none',
																			boxSizing: 'border-box',
																			fontSize: '14px',
																			fontWeight: 400,
																			lineHeight: '20px',
																			padding: '8px 12px',
																			marginBottom: '0',
																			color: '#B6C2CF',
																			backgroundColor: '#22272B',
																		}}
																	/>
																</div>
															</div>
														</div>
														<div
															style={{
																display: 'grid',
																gridColumn: '1 / -1',
																gridTemplateColumns: 'subgrid',
																padding: '8px 0',
															}}></div>
													</div>
												</section>
											</div>
											<div
												style={{
													gridColumnStart: 'sidebar',
													paddingRight: '16px',
													paddingBottom: '24px',
												}}>
												<section>
													<ul
														style={{
															display: 'flex',
															flexDirection: 'column',
															margin: 0,
															padding: 0,
															listStyle: 'none',
															rowGap: '8px',
														}}>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<BsPersonAdd
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Join
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<IoPersonOutline
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Members
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<TiTag
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Labels
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<IoMdCheckboxOutline
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Checklist
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<SlClock
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Dates
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<GrAttachment
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Attachment
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<MdLocationOn
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Location
															</button>
														</li>
														<li>
															<button
																style={{
																	justifyContent: 'flex-start',
																	textAlign: 'left',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	scrollMargin: '8px',
																	width: '100%',
																	fontSize: '14px',
																	lineHeight: '20px',
																	display: 'inline-flex',
																	boxSizing: 'border-box',
																	alignItems: 'center',
																	padding: '6px 12px',
																	borderRadius: '3px',
																	textDecoration: 'none',
																	whiteSpace: 'normal',
																	cursor: 'pointer',
																	border: 'none',
																	backgroundColor: '#a1bdd914',
																	color: '#B6C2CF',
																	fontWeight: '600',
																}}
																onMouseEnter={(e) =>
																	(e.currentTarget.style.backgroundColor =
																		'#a6c5e229')
																}
																onMouseLeave={(e) =>
																	(e.currentTarget.style.background =
																		'#a1bdd914')
																}>
																<FiCreditCard
																	style={{ marginRight: '8px' }}
																	size={16}
																/>
																Cover
															</button>
														</li>
													</ul>
												</section>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ViewTaskModal
