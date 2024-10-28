import React, { useState } from 'react'
import {
	Modal,
	Button,
	Form,
	Table,
	Collapse,
	Row,
	Col,
	ListGroup,
} from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useLeadList } from '../useLeadList'
import { useAuthContext } from '@/common'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs'

const schema = yup.object().shape({
	leadFile: yup
		.mixed()
		.required('A file is required')
		.test('fileSize', 'File size is too large (Max: 5MB)', (value) => {
			return value && value[0] && value[0].size <= 5000000
		})
		.test('fileType', 'Only CSV or XLS files are allowed', (value) => {
			return (
				value &&
				value[0] &&
				['application/vnd.ms-excel', 'text/csv'].includes(value[0].type)
			)
		}),
})

const DEFAULT_FIELD_MAPPINGS = {
	id: ['id', 'Id', 'iD', 'ID'],
	firstname: ['firstname', 'Firstname', 'FirstName', 'FIRSNAME'],
	lastname: ['lastname', 'Lastname', 'LastName', 'LASTNAME'],
	email: ['Email', 'email'],
	phone: ['Phone', 'phone'],
	gender: ['Gender', 'gender'],
	dob: ['DOB', 'dob'],
	nationality: ['Nationality', 'nationality'],
	maritalStatus: ['Marital Status', 'maritalStatus'],
	passportNumber: ['Passport Number', 'passportNumber'],
	visaCategory: ['Visa Category', 'visaCategory'],
	passportExpiry: ['Passport Expiry', 'passportExpiry'],
	currentAddress: ['Current Address', 'currentAddress'],
	permanentAddress: ['Permanent Address', 'permanentAddress'],
	highestQualification: ['Highest Qualification', 'highestQualification'],
	fieldOfStudy: ['Field of Study', 'fieldOfStudy'],
	institutionName: ['Institution Name', 'institutionName'],
	graduationYear: ['Graduation Year', 'graduationYear'],
	grade: ['Grade', 'grade'],
	testType: ['Test Type', 'testType'],
	testScore: ['Test Score', 'testScore'],
	countryOfInterest: ['Country of Interest', 'countryOfInterest'],
	courseOfInterest: ['Course of Interest', 'courseOfInterest'],
	desiredFieldOfStudy: ['Desired Field of Study', 'desiredFieldOfStudy'],
	preferredInstitutions: ['Preferred Institutions', 'preferredInstitutions'],
	intakeSession: ['Intake Session', 'intakeSession'],
	reasonForImmigration: ['Reason for Immigration', 'reasonForImmigration'],
	financialSupport: ['Financial Support', 'financialSupport'],
	sponsorDetails: ['Sponsor Details', 'sponsorDetails'],
	scholarships: ['Scholarships', 'scholarships'],
	communicationMode: ['Communication Mode', 'communicationMode'],
	preferredContactTime: ['Preferred Contact Time', 'preferredContactTime'],
	leadSource: ['Lead Source', 'leadSource'],
	referralContact: ['Referral Contact', 'referralContact'],
	leadStatus: ['Lead Status', 'leadStatus'],
	followUpDates: ['Follow-up Dates', 'followUpDates'],
	leadRating: ['Lead Rating', 'leadRating'],
	userID: ['userID', 'USERID', 'USER_ID', 'userid', 'user_id'],
	district: ['District', 'district'],
	state: ['State', 'state'],
	city: ['City', 'city'],
	country: ['Country', 'country'],
	pincode: ['Pincode', 'pincode'],
}

interface ParameterUpload {
	show: boolean
	handleClose: () => void
	refreshLeads: () => void
}

const BulkLeadModal: React.FC<ParameterUpload> = ({
	show,
	handleClose,
	refreshLeads,
}) => {
	const { uploadLeads } = useLeadList()
	const { user } = useAuthContext()
	const [previewData, setPreviewData] = useState<any[]>([])
	const [fileError, setFileError] = useState<string | null>(null)
	const [columnMappings, setColumnMappings] = useState<Record<string, string>>(
		{}
	)
	const [autoMappedColumns, setAutoMappedColumns] = useState<
		Record<string, boolean>
	>({})
	const [missingFields, setMissingFields] = useState<string[]>()
	const {
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	})
	const [showReport, setShowReport] = useState<boolean>(false)
	const [showMapping, setShowMapping] = useState<boolean>(false)
	const [showPreview, setShowPreview] = useState<boolean>(false)

	const handleRemove = () => {
		setPreviewData([])
		setColumnMappings({})
	}

	const onSubmit = async () => {
		const leadData = {
			tenantID: user.tenantID,
			userID: user.sub,
			importedData: previewData.map((row) => {
				const mappedRow: any = {}
				Object.keys(columnMappings).forEach((fileCol) => {
					const mappedField = columnMappings[fileCol]
					mappedRow[mappedField] = row[fileCol]
				})
				return mappedRow
			}),
		}

		console.log('LeadData:', leadData)

		// try {
		// 	await uploadLeads(leadData)
		// 	handleClose()
		// 	refreshLeads()
		// 	handleRemove()
		// 	reset()
		// } catch (error) {
		// 	toast.error('Failed to upload file')
		// 	handleRemove()
		// 	reset()
		// }
	}

	const handleFileChange = (e: any) => {
		const file = e.target.files[0]
		setValue('leadFile', e.target.files)
		setFileError(null)

		if (file) {
			const reader = new FileReader()
			reader.onload = (event) => {
				const data = event.target?.result
				if (file.type === 'text/csv') {
					Papa.parse(data as string, {
						header: true,
						skipEmptyLines: 'greedy',
						complete: (results) => {
							setPreviewData(results.data)
							autoMapColumns(results.meta.fields || [])
						},
						error: () => {
							setFileError('Error reading CSV file')
						},
					})
				} else if (file.type === 'application/vnd.ms-excel') {
					const workbook = XLSX.read(data, { type: 'binary' })
					const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
					const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
					setPreviewData(excelData)
					autoMapColumns(excelData[0])
				} else {
					setFileError('Unsupported file format')
				}
			}
			reader.readAsText(file)
		}
	}

	const autoMapColumns = (fileColumns: string[]) => {
		const mappings: Record<string, string> = {}
		const autoMapped: Record<string, boolean> = {}
		const missingFields: string[] = []

		fileColumns.forEach((fileCol) => {
			for (const [key, variants] of Object.entries(DEFAULT_FIELD_MAPPINGS)) {
				if (variants.includes(fileCol)) {
					mappings[fileCol] = key
					autoMapped[fileCol] = true
					break
				}
			}
		})

		for (const key of Object.keys(DEFAULT_FIELD_MAPPINGS)) {
			if (!Object.values(mappings).includes(key)) {
				missingFields.push(key)
			}
		}
		setColumnMappings(mappings)
		setAutoMappedColumns(autoMapped)
		setMissingFields(missingFields)
	}

	const handleMappingChange = (fileColumn: string, leadField: string) => {
		setColumnMappings((prev) => ({ ...prev, [fileColumn]: leadField }))
	}

	return (
		<Modal show={show} onHide={handleClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Import Bulk Leads</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Form.Group controlId="formFile">
						<Form.Label>Upload Lead File</Form.Label>
						<Form.Control
							type="file"
							onChange={handleFileChange}
							isInvalid={!!errors.leadFile}
						/>
						{errors.leadFile && (
							<Form.Control.Feedback type="invalid">
								{errors.leadFile.message}
							</Form.Control.Feedback>
						)}
					</Form.Group>
					{fileError && <p className="text-danger">{fileError}</p>}

					{previewData.length > 0 && (
						<div className="d-flex justify-content-center my-3">
							{missingFields && missingFields?.length > 0 && (
								<Button
									variant="outline-danger"
									onClick={() => setShowReport(!showReport)}
									aria-controls="report-collapse"
									aria-expanded={showReport}
									className="me-2">
									Show validation report
								</Button>
							)}

							<Button
								variant="outline-primary"
								onClick={() => setShowMapping(!showMapping)}
								aria-controls="mapping-collapse"
								aria-expanded={showMapping}
								className="me-2">
								{showMapping ? 'Hide Mapping' : 'Show Mapping'}
							</Button>

							<Button
								variant="outline-primary"
								onClick={() => setShowPreview(!showPreview)}
								aria-controls="preview-collapse"
								aria-expanded={showPreview}>
								{showPreview ? 'Hide Preview' : 'Show Preview'}
							</Button>
						</div>
					)}

					<Collapse in={showReport}>
						<div
							id="report-collapse"
							className="mt-3"
							style={{
								maxHeight: '350px',
								overflowY: 'auto',
								padding: '15px',
								border: '1px solid #ddd',
								borderRadius: '5px',
								marginTop: '10px',
							}}>
							<h5 className="text-danger d-flex align-items-center">
								<BsExclamationTriangleFill className="me-2" />
								Validation Report
							</h5>
							<p className="text-muted">
								Please review the missing fields below:
							</p>
							<ListGroup variant="flush">
								{missingFields?.map((field, index) => (
									<ListGroup.Item
										key={index}
										className="d-flex align-items-center">
										<BsExclamationTriangleFill className="me-2 text-warning" />
										<span>{field}</span>
									</ListGroup.Item>
								))}
							</ListGroup>
						</div>
					</Collapse>

					<Collapse in={showMapping}>
						<div
							id="mapping-collapse"
							className="mt-3"
							style={{
								maxHeight: '350px',
								overflowY: 'auto',
								padding: '15px',
								backgroundColor: '#f8f9fa',
								border: '1px solid #ddd',
								borderRadius: '5px',
								marginTop: '10px',
							}}>
							{previewData.length > 0 && (
								<>
									<h5>Map Columns</h5>
									{Object.keys(previewData[0]).map((fileCol, idx) => {
										// Display three fields in one row
										if (idx % 3 === 0) {
											return (
												<Row key={idx} className="mb-2">
													<Col>
														<Form.Group controlId={`columnMapping-${fileCol}`}>
															<Form.Label>{fileCol}</Form.Label>
															<Form.Control
																as="select"
																value={columnMappings[fileCol] || ''}
																onChange={(e) =>
																	handleMappingChange(fileCol, e.target.value)
																}
																disabled={autoMappedColumns[fileCol]} // Disable if auto-mapped
															>
																<option value="">Select Field</option>
																{Object.entries(DEFAULT_FIELD_MAPPINGS).map(
																	([key, variants]) => (
																		<option key={key} value={key}>
																			{key}
																		</option>
																	)
																)}
															</Form.Control>
															{autoMappedColumns[fileCol] && (
																<div
																	style={{
																		color: 'green',
																		marginTop: '5px',
																		padding: '3px',
																		display: 'flex',
																		alignItems: 'center',
																	}}>
																	<BsCheckCircleFill
																		size={14}
																		className="me-1"
																	/>
																	<span>Auto Mapped</span>
																</div>
															)}
														</Form.Group>
													</Col>
													{/* Check if the next two columns exist to create additional fields */}
													{idx + 1 < Object.keys(previewData[0]).length && (
														<Col>
															<Form.Group
																controlId={`columnMapping-${Object.keys(previewData[0])[idx + 1]}`}>
																<Form.Label>
																	{Object.keys(previewData[0])[idx + 1]}
																</Form.Label>
																<Form.Control
																	as="select"
																	value={
																		columnMappings[
																			Object.keys(previewData[0])[idx + 1]
																		] || ''
																	}
																	onChange={(e) =>
																		handleMappingChange(
																			Object.keys(previewData[0])[idx + 1],
																			e.target.value
																		)
																	}
																	disabled={
																		autoMappedColumns[
																			Object.keys(previewData[0])[idx + 1]
																		]
																	} // Disable if auto-mapped
																>
																	<option value="">Select Field</option>
																	{Object.entries(DEFAULT_FIELD_MAPPINGS).map(
																		([key, variants]) => (
																			<option key={key} value={key}>
																				{key}
																			</option>
																		)
																	)}
																</Form.Control>
																{autoMappedColumns[
																	Object.keys(previewData[0])[idx + 1]
																] && (
																	<div
																		style={{
																			color: 'green',
																			marginTop: '5px',
																			padding: '3px',
																			display: 'flex',
																			alignItems: 'center',
																		}}>
																		<BsCheckCircleFill
																			size={14}
																			className="me-1"
																		/>
																		<span>Auto Mapped</span>
																	</div>
																)}
															</Form.Group>
														</Col>
													)}
													{idx + 2 < Object.keys(previewData[0]).length && (
														<Col>
															<Form.Group
																controlId={`columnMapping-${Object.keys(previewData[0])[idx + 2]}`}>
																<Form.Label>
																	{Object.keys(previewData[0])[idx + 2]}
																</Form.Label>
																<Form.Control
																	as="select"
																	value={
																		columnMappings[
																			Object.keys(previewData[0])[idx + 2]
																		] || ''
																	}
																	onChange={(e) =>
																		handleMappingChange(
																			Object.keys(previewData[0])[idx + 2],
																			e.target.value
																		)
																	}
																	disabled={
																		autoMappedColumns[
																			Object.keys(previewData[0])[idx + 2]
																		]
																	} // Disable if auto-mapped
																>
																	<option value="">Select Field</option>
																	{Object.entries(DEFAULT_FIELD_MAPPINGS).map(
																		([key, variants]) => (
																			<option key={key} value={key}>
																				{key}
																			</option>
																		)
																	)}
																</Form.Control>
																{autoMappedColumns[
																	Object.keys(previewData[0])[idx + 2]
																] && (
																	<div
																		style={{
																			color: 'green',
																			marginTop: '5px',
																			padding: '3px',
																			display: 'flex',
																			alignItems: 'center',
																		}}>
																		<BsCheckCircleFill
																			size={14}
																			className="me-1"
																		/>
																		<span>Auto Mapped</span>
																	</div>
																)}
															</Form.Group>
														</Col>
													)}
												</Row>
											)
										}
										return null // If not a starting index for a new row
									})}
								</>
							)}
						</div>
					</Collapse>

					<Collapse in={showPreview}>
						<div
							id="preview-collapse"
							style={{
								maxHeight: '350px',
								overflowY: 'auto',
								padding: '15px',
								backgroundColor: '#f1f1f1',
								border: '1px solid #ddd',
								borderRadius: '5px',
								marginTop: '10px',
							}}>
							<>
								<h5>Preview Data</h5>
								{previewData.length > 0 && (
									<Table bordered style={{ fontSize: '0.9rem' }}>
										<thead>
											<tr>
												{Object.keys(previewData[0]).map((header, index) => (
													<th key={index}>{header}</th>
												))}
											</tr>
										</thead>
										<tbody>
											{previewData.slice(0, 5).map((row, rowIndex) => (
												<tr key={rowIndex}>
													{Object.values(row).map((value, colIndex) => (
														<td key={colIndex}>{value}</td>
													))}
												</tr>
											))}
										</tbody>
									</Table>
								)}
								<p>Displaying first 5 rows for preview...</p>
							</>
						</div>
					</Collapse>

					<div className="d-flex justify-content-end mt-4">
						<Button variant="success" type="submit">
							Upload
						</Button>
						<Button
							variant="outline-danger"
							className="ms-2"
							type="reset"
							onClick={handleRemove}>
							Remove File
						</Button>
					</div>
				</Form>
			</Modal.Body>
		</Modal>
	)
}

export default BulkLeadModal
