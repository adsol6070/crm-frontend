import { Column } from 'react-table'
import { PageSize, ProgressBar } from '@/components'
import React, { useEffect, useMemo, useState } from 'react'
import { LeadData } from '@/types'
import {
	checklistsApi,
	leadApi,
	useAuthContext,
	usePermissions,
	useThemeContext,
} from '@/common'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import Swal from 'sweetalert2'
import styles from './LeadList.module.css'
import { actionStyle, capitalizeFirstLetter, hasPermission } from '@/utils'
import { formatStringDisplayName } from '@/utils/formatString'
import useAddDocumentChecklist from '../DocumentChecklist/useDocumentChecklist'

interface HistoryItem {
	action: string
	timestamp: string
	details: {
		createdBy?: { firstname: string; lastname: string }
		updatedBy?: { firstname: string; lastname: string }
		statusUpdatedBy?: { firstname: string; lastname: string }
		assignedAgents?: { id: string; firstname: string; lastname: string }[]
	}
}

interface LeadListHookResult {
	columns: ReadonlyArray<Column<any>>
	sizePerPageList: PageSize[]
	leadRecords: LeadData[]
	loading: boolean
	downloadCSV: (category: string) => void
	downloadFullCSV: (category: string) => void
	refreshLeads: () => void
	uploadLeads: (formData: FormData) => Promise<void>
	deleteAllLeads: () => void
	visaCategories: string[]
	showAssignModal: boolean
	setShowAssignModal: React.Dispatch<React.SetStateAction<boolean>>
	selectedLeadId: string
	setSelectedLeadId: React.Dispatch<React.SetStateAction<string>>
	handleAssign: (leadId: string, assignees: string[]) => void
	showHistoryModal: boolean
	setShowHistoryModal: React.Dispatch<React.SetStateAction<boolean>>
	historyData: HistoryItem[]
	handleCloseAssignModal: () => void
	selectedAssignees: string[]
	setSelectedAssignees: React.Dispatch<React.SetStateAction<string[]>>
}

export const useLeadList = (): LeadListHookResult => {
	const { permissions } = usePermissions()
	const navigate = useNavigate()
	const { user } = useAuthContext()
	const { settings } = useThemeContext()
	const [loading, setLoading] = useState(true)
	const [leadRecords, setLeadRecords] = useState<LeadData[]>([])
	const [leadStatuses, setLeadStatuses] = useState<{ [key: string]: string }>(
		{}
	)
	const [visaCategories, setVisaCategories] = useState<string[]>([])
	const [showAssignModal, setShowAssignModal] = useState(false)
	const [selectedLeadId, setSelectedLeadId] = useState<string>('')
	const [showHistoryModal, setShowHistoryModal] = useState(false)
	const [historyData, setHistoryData] = useState<HistoryItem[]>([])
	const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
	const [progressData, setProgressData] = useState<{ [key: string]: string }>({});
	const [checklistData, setChecklistData] = useState<{ [key: string]: string }>({});

	const handleAssignButtonClick = async (leadId: string) => {
		setSelectedLeadId(leadId)
		try {
			const leadAssignees = await leadApi.getAssigneeById(leadId)
			if (leadAssignees && leadAssignees.user_id) {
				setSelectedAssignees(leadAssignees.user_id)
			} else {
				setSelectedAssignees([])
			}
			setShowAssignModal(true)
		} catch (error) {
			console.error('Failed to fetch assignee data:', error)
			setSelectedAssignees([])
			setShowAssignModal(true)
		}
	}

	const handleCloseAssignModal = async () => {
		setSelectedAssignees([])
		setShowAssignModal(false)
	}

	const transformLeadHistory = (leadHistory: any[]) => {
		return leadHistory.map((entry) => {
			let action = ''
			let details = entry.details

			if (entry.details.updatedBy) {
				action = `Updated by ${entry.details.updatedBy.firstname} ${entry.details.updatedBy.lastname}`
			} else if (entry.details.createdBy) {
				if (entry.details == '') {
					action = 'Created By User'
				}
				action = `Created by ${entry.details.createdBy.firstname} ${entry.details.createdBy.lastname}`
			} else if (entry.details.statusUpdatedBy) {
				action = `Status Updated by ${entry.details.statusUpdatedBy.firstname} ${entry.details.statusUpdatedBy.lastname}`
			} else {
				action = entry.action
			}

			return {
				action,
				timestamp: entry.timestamp,
				details,
			}
		})
	}

	const handleHistoryClick = async (leadId: string) => {
		try {
			const response = await leadApi.getLeadHistory(leadId)
			const transformedHistory = transformLeadHistory(response.fullLeadHistory)
			setHistoryData(transformedHistory)
			setShowHistoryModal(true)
		} catch (error) {
			toast.error('Failed to fetch history')
			console.error(error)
		}
	}

	const handleAssign = async (leadId: string, assignees: string[]) => {
		try {
			const response = await leadApi.assignLead({
				lead_id: leadId,
				user_id: assignees,
			})
			toast.success(response.message)
		} catch (error) {
			toast.error('Failed to assign lead')
			console.error(error)
		}
	}

	const columns = useMemo(
		() => [
			{
				Header: 'S.No',
				accessor: 'sno',
				defaultCanSort: true,
			},
			{
				Header: 'ID',
				accessor: 'id',
				defaultCanSort: true,
			},
			{
				Header: 'Firstname',
				accessor: 'firstname',
				defaultCanSort: true,
				Cell: ({ cell }: any) => capitalizeFirstLetter(cell.value),
			},
			{
				Header: 'Lastname',
				accessor: 'lastname',
				defaultCanSort: false,
				Cell: ({ cell }: any) => capitalizeFirstLetter(cell.value),
			},
			{
				Header: 'Email',
				accessor: 'email',
				defaultCanSort: true,
			},
			{
				Header: 'Phone',
				accessor: 'phone',
				defaultCanSort: false,
			},
			{
				Header: 'Visa Category',
				accessor: 'visaCategory',
				defaultCanSort: true,
				Cell: ({ cell }: any) => formatStringDisplayName(cell.value),
			},
			{
				Header: 'Uploaded Documents',
				accessor: 'uploadedDocuments',
				defaultCanSort: true,
				Cell: ({ cell }: any) => {
					return <span>
						{progressData[cell.row.original.id]
							? <ProgressBar totalDocuments={checklistData[cell.row.original.visaCategory]} uploadedDocuments={progressData[cell.row.original.id]} />
							: <ProgressBar totalDocuments={checklistData[cell.row.original.visaCategory]} uploadedDocuments={0} />}

					</span>
				}
			},
			{
				Header: 'Status',
				accessor: 'status',
				disableSortBy: true,
				Cell: ({ cell }: any) => {
					if (hasPermission(permissions, 'Leads', 'Status')) {
						return (
							<Dropdown
								onSelect={(status: any) =>
									handleStatus(cell.row.original.id, status)
								}>
								<Dropdown.Toggle
									as="div"
									className={`badge btn btn-${getStatusBadgeClass(leadStatuses[cell.row.original.id])} ${styles.statusStyling}`}
									id="dropdown-basic">
									<span>
										{leadStatuses[cell.row.original.id]
											? capitalizeFirstLetter(
												leadStatuses[cell.row.original.id]
											)
											: 'No Status'}
									</span>
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item eventKey="new">New</Dropdown.Item>
									<Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
									<Dropdown.Item eventKey="inprogress">
										Inprogress
									</Dropdown.Item>
									<Dropdown.Item eventKey="completed">Completed</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						)
					} else {
						return (
							<div
								className={`badge btn btn-${getStatusBadgeClass(leadStatuses[cell.row.original.id])} ${styles.statusStyling}`}>
								<span>
									{leadStatuses[cell.row.original.id]
										? capitalizeFirstLetter(leadStatuses[cell.row.original.id])
										: 'No Status'}
								</span>
							</div>
						)
					}
				},
			},
		],
		[leadStatuses, progressData]
	)

	const actionsColumn = {
		Header: 'Actions',
		accessor: 'actions',
		disableSortBy: true,
		Cell: ({ cell }: any) => (
			<Dropdown className={styles.dropdownStyling}>
				<Dropdown.Toggle as="button" className={styles.customActionButton}>
					<i className={`bi bi-gear ${styles.biGear}`}></i>
				</Dropdown.Toggle>
				<Dropdown.Menu
					className={styles.customMenuStyle}
					style={actionStyle(settings.theme === 'dark')}>
					{hasPermission(permissions, 'Leads', 'AddNotes') && (
						<Dropdown.Item onClick={() => handleAddNotes(cell.row.original.id)}>
							Add Notes
						</Dropdown.Item>
					)}
					{hasPermission(permissions, 'Leads', 'View') && (
						<Dropdown.Item onClick={() => handleView(cell.row.original.id)}>
							View
						</Dropdown.Item>
					)}
					{hasPermission(permissions, 'Leads', 'Edit') && (
						<Dropdown.Item onClick={() => handleEdit(cell.row.original.id)}>
							Edit
						</Dropdown.Item>
					)}
					{hasPermission(permissions, 'Leads', 'Checklist') && (
						<Dropdown.Item
							onClick={() => handleChecklist(cell.row.original.id)}>
							Checklist
						</Dropdown.Item>
					)}
					{hasPermission(permissions, 'Leads', 'Delete') && (
						<Dropdown.Item onClick={() => handleDelete(cell.row.original.id)}>
							Delete
						</Dropdown.Item>
					)}
				</Dropdown.Menu>
			</Dropdown>
		),
	}

	const insertColumnsBeforeActions = () => {
		const index = columns.findIndex((column) => column.accessor === 'actions')

		if (index > -1) {
			if (
				hasPermission(permissions, 'Leads', 'Assign') &&
				!columns.some((col) => col.accessor === 'assign')
			) {
				columns.splice(index, 0, {
					Header: 'Assign',
					accessor: 'assign',
					disableSortBy: true,
					Cell: ({ cell }: any) => (
						<button
							className={`btn btn-sm btn-danger ${styles.assignButton}`}
							onClick={() => handleAssignButtonClick(cell.row.original.id)}>
							<i className={`ri-user-add-line ${styles.riUserAddLine}`}></i>{' '}
							Assign
						</button>
					),
				})
			}

			if (
				hasPermission(permissions, 'Leads', 'History') &&
				!columns.some((col) => col.accessor === 'history')
			) {
				columns.splice(index, 0, {
					Header: 'History',
					accessor: 'history',
					disableSortBy: true,
					Cell: ({ cell }: any) => (
						<button
							className={`btn btn-sm btn-info ${styles.historyButton}`}
							onClick={() => handleHistoryClick(cell.row.original.id)}>
							<i className={`ri-history-line ${styles.riHistoryLine}`}></i>{' '}
							History
						</button>
					),
				})
			}
		}
	}

	if (!columns.some((col) => col.accessor === 'actions')) {
		columns.push(actionsColumn)
	}

	insertColumnsBeforeActions()

	const getDocumentStatus = async () => {
		try {
			const response = await leadApi.getLeadDocumentStatus();
			const checklistResponse = await checklistsApi.getChecklist();
			const formattedChecklistData = checklistResponse.checklists.reduce((acc: any, curr: any) => {
				acc[curr.visaType] = curr.checklist.length
				return acc
			}, {})
			const formattedData = response.reduce((acc: any, curr: any) => {
				acc[curr.leadID] = curr.documents.length
				return acc
			}, {})
			setChecklistData(formattedChecklistData)
			setProgressData(formattedData)
		} catch (error) {
			toast.error('Failed to get lead document status.')
			console.error(error)
		}
	}

	const handleStatusChange = (leadId: string, status: string) => {
		setLeadStatuses((prevStatuses) => ({
			...prevStatuses,
			[leadId]: status,
		}))
	}

	const handleStatus = async (leadId: string, status: string) => {
		try {
			const data = {
				userID: user.sub,
				leadStatus: status,
			}
			await leadApi.updateLeadStatusById(leadId, data)
			handleStatusChange(leadId, status)
			toast.success('Lead status updated successfully.')
		} catch (error) {
			toast.error('Failed to update lead status.')
			console.error(error)
		}
	}

	const getLeadStatuses = async () => {
		try {
			const response = await leadApi.get()
			const leadStatuses = response.reduce((acc: any, curr: any) => {
				acc[curr.id] = curr.leadStatus
				return acc
			}, {})
			setLeadStatuses(leadStatuses)
		} catch (error) {
			toast.error('Failed to get lead statuses.')
			console.error(error)
		}
	}

	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case 'pending':
				return 'warning'
			case 'inprogress':
				return 'primary'
			case 'completed':
				return 'success'
			default:
				return 'secondary'
		}
	}

	const handleEdit = (leadId: string) => {
		navigate(`/lead/edit/${leadId}`)
	}

	const handleChecklist = (leadId: string) => {
		navigate(`/lead/addDocument/${leadId}`)
	}

	const handleAddNotes = (leadId: string) => {
		navigate(`/lead/leadNotes/${leadId}`)
	}

	const handleView = (leadId: string) => {
		navigate(`/lead/read/${leadId}`)
	}

	const handleDelete = async (leadId: string) => {
		try {
			await leadApi.delete(leadId)
			const updatedLeadRecords = leadRecords.filter(
				(lead) => lead.id !== leadId
			)
			setLeadRecords(updatedLeadRecords)
			toast.success('Lead deleted successfully.')
		} catch (error) {
			toast.error('Failed to delete lead.')
			console.error(error)
		}
	}

	const deleteAllLeads = async () => {
		if (leadRecords.length === 0) {
			Swal.fire({
				icon: 'warning',
				title: 'No Data',
				text: 'No Leads found to delete',
			})
			return
		}
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to get your leads back",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete all!',
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await leadApi.deleteAllLeads()
					setLeadRecords([])
					toast.success('All leads deleted successfully.')
				} catch (error) {
					toast.error('Failed to delete all leads')
					console.error(error)
				}
			}
		})
	}

	const sizePerPageList: PageSize[] = [
		{
			text: '5',
			value: 5,
		},
		{
			text: '10',
			value: 10,
		},
		{
			text: '25',
			value: 25,
		},
		{
			text: 'All',
			value: leadRecords.length,
		},
	]

	const getLeads = async () => {
		setLoading(true)
		try {
			if (user.role === 'super_admin') {
				const leadData = await leadApi.get()
				const leadsWithIndex = leadData.map((lead: any, index: any) => ({
					...lead,
					sno: index + 1,
				}))
				setLeadRecords(leadsWithIndex)

				await getLeadStatuses()
				await getDocumentStatus();
				const categories: any = [
					...new Set(leadData.map((lead: any) => lead.visaCategory)),
				]
				setVisaCategories(categories)
			} else {
				const leadData = await leadApi.getSpecificLead(user.sub)
				const leadsWithIndex = leadData.map((lead: any, index: any) => ({
					...lead,
					sno: index + 1,
				}))
				setLeadRecords(leadsWithIndex)

				await getLeadStatuses()
				await getDocumentStatus();

				const categories: any = [
					...new Set(leadData.map((lead: any) => lead.visaCategory)),
				]
				setVisaCategories(categories)
			}
		} catch (error) {
			toast.error('Failed to fetch leads')
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		{
			hasPermission(permissions, 'Leads', 'View') && getLeads()
		}
	}, [])

	const uploadLeads = async (formData: FormData) => {
		setLoading(true)
		try {
			const data = await leadApi.uploadBulkLeads(formData)
			toast.success(data.message)
		} catch (error: any) {
			toast.error('Lead not imported')
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const refreshLeads = () => {
		getLeads()
	}

	const convertToCSV = (array: any[]) => {
		const excludedFields = ['tenantID', 'sno', 'leadHistory']
		const header =
			Object.keys(array[0])
				.filter((key) => !excludedFields.includes(key))
				.join(',') + '\n'

		const rows = array
			.map((obj) => {
				return Object.keys(obj)
					.filter((key) => !excludedFields.includes(key))
					.map((key) => {
						if (key === 'leadHistory') {
							return JSON.stringify(obj[key])
						}
						return obj[key]
					})
					.join(',')
			})
			.join('\n')

		return header + rows
	}

	const downloadCSV = (category: string) => {
		let filteredRecords = leadRecords
		if (category !== 'All') {
			filteredRecords = leadRecords.filter(
				(lead) => lead.visaCategory === category
			)
		}

		if (filteredRecords.length === 0) {
			Swal.fire({
				icon: 'warning',
				title: 'No Data',
				text: 'No data to download',
			})
			return
		}

		const csv = convertToCSV(filteredRecords)
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.setAttribute('hidden', '')
		a.setAttribute('href', url)
		a.setAttribute('download', 'leads.csv')
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)

		Swal.fire({
			icon: 'success',
			title: 'Download Complete',
			text: 'Your CSV file has been downloaded.',
		})
	}

	const downloadFullCSV = async (category: string) => {
		try {
			const response = await leadApi.downloadLeadCsv(category);
			const url = window.URL.createObjectURL(response);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "leads_data.csv");
			link.click();
		} catch (error) {
			console.error("Error downloading CSV file", error);
		}
	}

	return {
		columns,
		sizePerPageList,
		leadRecords,
		loading,
		refreshLeads,
		uploadLeads,
		downloadCSV,
		deleteAllLeads,
		visaCategories,
		showAssignModal,
		setShowAssignModal,
		selectedLeadId,
		setSelectedLeadId,
		handleAssign,
		showHistoryModal,
		setShowHistoryModal,
		historyData,
		handleCloseAssignModal,
		selectedAssignees,
		setSelectedAssignees,
		downloadFullCSV,
	}
}
