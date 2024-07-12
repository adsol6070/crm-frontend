import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './leadNotes.module.css'
import { PageBreadcrumb } from '@/components'
import { Col, Row } from 'react-bootstrap'
import useCreateLeadNote from './useLeadNotes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Swal from 'sweetalert2'
import { hasPermission } from '@/utils'
import { usePermissions } from '@/common'

// Note type definition
interface User {
	id: string
	tenantID: string
	firstname: string
	lastname: string
	email: string
	phone: string
	profileImage: string | null
	isEmailVerified: boolean
	role: string
	created_at: string
	updated_at: string
	online: boolean
	last_active: string
}

interface Note {
	id?: string
	lead_id?: string
	user_id?: string
	note?: string
	created_at?: string
	updated_at?: string
	user?: User
}

const LeadNotes: React.FC = () => {
	const { permissions } = usePermissions()
	const { leadId } = useParams() as { leadId: string }
	const [notes, setNotes] = useState<Note[]>([])
	const [newNote, setNewNote] = useState<string>('')
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
	const [editingNoteText, setEditingNoteText] = useState<string>('')
	const {
		createLeadNote,
		fetchNotes,
		deleteNotesById,
		deleteAllLeadNotes,
		updateLeadNote,
	} = useCreateLeadNote(leadId)

	const capitalizeFirstLetter = (str: string) => {
		if (!str) return str
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	const getAllLeadNotes = async () => {
		const data: Note[] = await fetchNotes()
		setNotes(data)
	}

	// Create a new note
	const handleAddNote = async () => {
		if (newNote.trim() !== '') {
			const newNoteObj: Note = { note: newNote }
			await createLeadNote(newNoteObj)
			await getAllLeadNotes()
			setNewNote('')
		}
	}

	// Delete a note
	const handleDeleteNote = async (id: string) => {
		await deleteNotesById(id)
		await getAllLeadNotes()
	}

	const handleDeleteAllNotes = async () => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to get your notes back",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete all!',
		}).then(async (result) => {
			if (result.isConfirmed) {
				await deleteAllLeadNotes()
				await getAllLeadNotes()
			}
		})
	}

	// Start editing a note
	const handleEditNote = (note: Note) => {
		setEditingNoteId(note.id || null)
		setEditingNoteText(note.note || '')
	}

	// Save the edited note
	const handleSaveEditNote = async () => {
		if (editingNoteId) {
			const updatedNote: Note = { note: editingNoteText }
			await updateLeadNote(editingNoteId, updatedNote)
			setEditingNoteId(null)
			setEditingNoteText('')
			await getAllLeadNotes()
		}
	}

	useEffect(() => {
		getAllLeadNotes()
	}, [leadId])

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Lead Notes" subName="Leads" />
			<Row>
				<Col className="container" md={8}>
					<div className={styles.noteInput}>
						<textarea
							value={newNote}
							onChange={(e) => setNewNote(e.target.value)}
							placeholder="Add a new note"
							className="form-control"
						/>
					</div>
					<div>
						<button
							onClick={handleAddNote}
							className={`btn btn-primary my-2 ${styles.addButton}`}>
							Add Note
						</button>
					</div>
				</Col>
			</Row>
			<Row>
				<Col className="container" md={8}>
					{notes.length === 0 ? (
						<div className={styles.noNotesBox}>
							<p>No notes to display</p>
						</div>
					) : (
						<div>
							{hasPermission(permissions, 'Leads', 'DeleteNotes') && (
								<div className="d-flex align-items-center justify-content-end my-1">
									<button
										className={`btn btn-danger ${styles.deleteAllButton}`}
										onClick={handleDeleteAllNotes}>
										Delete All Notes
									</button>
								</div>
							)}
							<div className={styles.notesContainer}>
								{notes.map((note) => (
									<div key={note.id} className={`${styles.noteCard} card`}>
										<div className={styles.cardTopBar}>
											{editingNoteId === note.id ? (
												<button
													onClick={handleSaveEditNote}
													className={styles.iconButton}>
													<i className="ri-save-line"></i>
												</button>
											) : (
												<>
												{hasPermission(permissions, 'Leads', 'EditNote') && (
													<button
														onClick={() => handleEditNote(note)}
														className={styles.iconButton}>
														<i className="ri-edit-2-line"></i>
													</button>)}
													{hasPermission(permissions, 'Leads', 'DeleteNote') && (
													<button
														onClick={() => handleDeleteNote(note.id!)}
														className={styles.iconButton}>
														<i className="ri-delete-bin-6-line"></i>
													</button>)}
												</>
											)}
										</div>
										{editingNoteId === note.id ? (
											<div className={styles.noteEdit}>
												<textarea
													value={editingNoteText}
													onChange={(e) => setEditingNoteText(e.target.value)}
													className="form-control"
												/>
											</div>
										) : (
											<div className="card-body">
												<p className="card-text">
													<strong>Note: </strong>
													{note.note}
												</p>
												<div className={styles.userDetails}>
													<small>
														<strong>Created By: </strong>{' '}
														{note.user?.firstname
															? capitalizeFirstLetter(note.user.firstname)
															: ''}{' '}
														{note.user?.lastname
															? capitalizeFirstLetter(note.user.lastname)
															: ''}
													</small>
												</div>
												<div className={styles.noteTimestamps}>
													<small>
														<strong>Created at: </strong>
														{new Date(note.created_at!).toLocaleString()}
													</small>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</Col>
			</Row>
		</>
	)
}

export default LeadNotes
