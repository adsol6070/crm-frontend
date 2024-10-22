import { useState, useMemo } from 'react'
import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Button, Nav, Spinner, Dropdown } from 'react-bootstrap'
import { useLeadList } from './useLeadList'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BulkLeadModal from './modals/bulkLeadModal'
import AssignModal from './modals/assignModal'
import styles from './LeadList.module.css'
import { useUserList } from '@/pages/user/List/useUserList'
import { leadApi, usePermissions, useThemeContext } from '@/common'
import { capitalizeFirstLetter, hasPermission, textStyle } from '@/utils'
import HistoryModal from './modals/HistoryModal'
import UpdateModal from './modals/updateModal'
import { formatStringDisplayName } from '@/utils/formatString'
import Swal from 'sweetalert2'

const LeadList = () => {
	const { settings } = useThemeContext()
	const { permissions } = usePermissions()
	const {
		columns,
		leadRecords,
		refreshLeads,
		deleteAllLeads,
		downloadCSV,
		visaCategories,
		showAssignModal,
		selectedLeadId,
		handleAssign,
		showHistoryModal,
		setShowHistoryModal,
		historyData,
		handleCloseAssignModal,
		selectedAssignees,
		setSelectedAssignees,
		loading,
		downloadFullCSV,
	} = useLeadList()
	const { userRecords } = useUserList()

	const [showModal, setShowModal] = useState(false)
	const [showUpdateModal, setShowUpdateModal] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState('All')
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
	console.log("selectedUserIds", selectedUserIds)

	const canDeleteSelected = hasPermission(
		permissions,
		'Leads',
		'DeleteSelected'
	)
	const canUpdateSelected = hasPermission(permissions, 'Leads', 'Edit')

	let toggleAllRowsSelected: ((selected: boolean) => void) | undefined;

	const showSelectedActions = selectedUserIds?.length > 0

	const handleDeleteSelected = async (selectedUserIds: any[]) => {
		try {
			await leadApi.deleteSelectedLeads({ leadIds: selectedUserIds })
			toast.success('Leads deleted successfully.')
			refreshLeads()
			setSelectedUserIds([])
			toggleAllRowsSelected && toggleAllRowsSelected(false)
		} catch (error) {
			toast.error('Failed to delete leads.')
			console.error(error)
		}
	}

	const handleDeleteSelectedLeads = () => {
		handleDeleteSelected(selectedUserIds)
	}

	const handleUpdateSelected = async (data: any) => {
		await leadApi.updateSelectedLeads(data)
		setSelectedUserIds([])
		refreshLeads()
		toggleAllRowsSelected && toggleAllRowsSelected(false)
	}

	const handleShow = () => setShowModal(true)
	const handleClose = () => setShowModal(false)
	const handleOpenUpdateModal = () => setShowUpdateModal(true)
	const handleCloseUpdateModal = () => setShowUpdateModal(false)

	const downloadCSVTemplate = () => {
		const link = document.createElement('a')
		link.href = '/format-file.csv'
		link.setAttribute('download', 'Bulk-Lead-Format.csv')
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const handleSelectCategory = (category: any) => {
		setSelectedCategory(category)
	}

	const filteredLeads = useMemo(() => {
		return selectedCategory === 'All'
			? leadRecords
			: leadRecords.filter((lead) => lead.visaCategory === selectedCategory)
	}, [selectedCategory, leadRecords])

	const selectedLeads = filteredLeads.filter((user) =>
		selectedUserIds.includes(user.id)
	)

	const downloadCsvOptions = () => {
		Swal.fire({
			title: 'Download Data',
			icon: 'question',
			showCancelButton: true,
			showCloseButton: true,
			confirmButtonText: 'Include History',
			cancelButtonText: 'Without History',
		}).then((result: any) => {
			if (result.isConfirmed) {
				downloadFullCSV(selectedCategory)
			} else if (result.dismiss === Swal.DismissReason.cancel) {
				downloadCSV(selectedCategory)
			}
		})
	}

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Leads List" subName="Leads" />
			<Row>
				<Col>
					<Card>
						<Card.Header>
							<Row className="align-items-center">
								<Col xs={12} md={6}>
									<h4 className="header-title">Lead Management</h4>
									<p className="text-muted mb-0">
										View and manage Lead accounts in the system.
									</p>
								</Col>
								<Col
									xs={12}
									md={6}
									className="text-md-end text-center mt-3 mt-md-0">
									{hasPermission(permissions, 'Leads', 'DownloadCSVFormat') && (
										<Button
											className="m-2"
											variant="secondary"
											onClick={downloadCSVTemplate}>
											Download CSV Format
										</Button>
									)}
									{hasPermission(permissions, 'Leads', 'ImportBulk') && (
										<Button
											className="m-2"
											variant="success"
											onClick={handleShow}>
											Import Bulk Leads
										</Button>
									)}
									{hasPermission(permissions, 'Leads', 'DownloadCSV') && (
											<Button
												className="m-2"
												variant="primary"
												onClick={downloadCsvOptions}>
												Download CSV
											</Button>
									)}
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<div className={styles.tabStyling}>
								<Nav
									variant="pills"
									activeKey={selectedCategory}
									onSelect={handleSelectCategory}
									className={styles.customTabs}>
									<Nav.Item className={styles.navItem}>
										<Nav.Link
											eventKey="All"
											className={styles.navLink}
											style={textStyle(settings.theme === 'dark')}>
											<i className={`bi bi-list ${styles.navLinkIcon}`}></i> All
										</Nav.Link>
									</Nav.Item>
									{visaCategories.map((category) => (
										<Nav.Item key={category} className={styles.navItem}>
											<Nav.Link
												eventKey={category}
												className={styles.navLink}
												style={textStyle(settings.theme === 'dark')}>
												<i
													className={`bi bi-${category.toLowerCase()} ${styles.navLinkIcon}`}></i>{' '}
												{formatStringDisplayName(category)}
											</Nav.Link>
										</Nav.Item>
									))}
								</Nav>
								<div className="d-flex justify-content-between">
									{showSelectedActions && (
										<Dropdown className='mx-2'>
											<Dropdown.Toggle variant="success" id="dropdown-actions">
												Actions for {selectedUserIds.length} Selected
											</Dropdown.Toggle>
											<Dropdown.Menu>
												{canUpdateSelected && (
													<Dropdown.Item onClick={handleOpenUpdateModal}>
														Update Selected
													</Dropdown.Item>
												)}
												{canDeleteSelected && (
													<Dropdown.Item onClick={handleDeleteSelectedLeads}>
														Delete Selected
													</Dropdown.Item>
												)}
											</Dropdown.Menu>
										</Dropdown>
									)}
									{hasPermission(permissions, 'Leads', 'DeleteAll') && (
										<Button variant="danger" onClick={deleteAllLeads}>
											Delete All Leads
										</Button>
									)}
								</div>
							</div>
							{loading ? (
								<div
									className="text-center"
									style={{
										height: '500px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
									<Spinner animation="border" role="status">
										<span className="visually-hidden">Loading...</span>
									</Spinner>
								</div>
							) : (
								<Table
									columns={columns}
									data={filteredLeads}
									pageSize={5}
									isSortable={true}
									pagination={true}
									isSelectable={true}
									isSearchable={true}
									setSelectedUserIds={setSelectedUserIds}
									toggleAllRowsSelected={(val) => (toggleAllRowsSelected = val)}
								/>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<BulkLeadModal
				show={showModal}
				handleClose={handleClose}
				refreshLeads={refreshLeads}
			/>
			<AssignModal
				show={showAssignModal}
				handleClose={handleCloseAssignModal}
				handleAssign={handleAssign}
				leadId={selectedLeadId}
				users={userRecords}
				selectedAssignees={selectedAssignees}
				setSelectedAssignees={setSelectedAssignees}
			/>
			<HistoryModal
				show={showHistoryModal}
				onHide={() => setShowHistoryModal(false)}
				historyData={historyData}
			/>
			<UpdateModal
				show={showUpdateModal}
				handleClose={handleCloseUpdateModal}
				selectedLeads={selectedLeads}
				handleUpdateSelected={handleUpdateSelected}
				selectedUserIds={selectedUserIds}
			/>
		</>
	)
}

export default LeadList
