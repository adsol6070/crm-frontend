import { useState, useEffect, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FormInput, PageBreadcrumb } from '@/components'
import { Stepper, Step } from 'react-form-stepper'
import Select from 'react-select'
import './AddLead.css'
import useCreateLead from './useCreateLeadForm'
import { Preferences } from '@capacitor/preferences'
import ReactToPrint from 'react-to-print'

interface CollectedData {
	[key: string]: any;
}
interface VisaCategory {
	value: string
	label: string
}

const fieldOrder = [
	"firstname", "lastname", "email", "phone", "gender", "dob", "nationality",
	"maritalStatus", "passportNumber", "passportExpiry", "currentAddress",
	"permanentAddress", "highestQualification", "fieldOfStudy", "institutionName",
	"graduationYear", "grade", "testType", "testScore", "countryOfInterest",
	"courseOfInterest", "desiredFieldOfStudy", "preferredInstitutions",
	"intakeSession", "reasonForImmigration", "financialSupport", "sponsorDetails",
	"scholarships",
	"visaExpiryDate", "visaType", "previousStudyAbroad", "previousVisaApplications",
	"leadNotes", "leadRating", "followUpDates", "assignedAgent", "leadStatus",
	"referralContact", "leadSource", "notes", "preferredContactTime", "communicationMode"
]

const reorderData = (data: any, order: any) => {
	const orderedData: CollectedData = {}
	order.forEach((key: any) => {
		if (data.hasOwnProperty(key)) {
			orderedData[key] = data[key]
		}
	})
	return orderedData
}

const stepSchemas = [
	yup
		.object({
			firstname: yup.string().required('Please enter your First Name'),
			lastname: yup.string().required('Please enter your Last Name'),
			email: yup.string().required('Please enter your Email').email('Please enter a valid Email'),
			phone: yup.string().required('Please enter your Phone Number'),
			gender: yup.string().required('Please select your Gender'),
			dob: yup.date().required('Please select your Date of Birth'),
			nationality: yup.string().required('Please enter your Nationality'),
			maritalStatus: yup.string().required('Please select your Marital Status'),
			passportNumber: yup.string(),
			currentAddress: yup.string().required('Please enter your Current Address'),
			permanentAddress: yup.string().required('Please enter your Permanent Address'),
		})
		.required(),
	yup
		.object({
			highestQualification: yup.string().required('Please enter your Highest Qualification'),
			fieldOfStudy: yup.string().nullable(),
			institutionName: yup.string().nullable(),
			graduationYear: yup.string().nullable(),
			grade: yup.string().nullable(),
			testType: yup.string().nullable(),
			testScore: yup.string().nullable(),
		})
		.required(),
	yup
		.object({
			countryOfInterest: yup.string().nullable(),
			courseOfInterest: yup.string().nullable(),
			desiredFieldOfStudy: yup.string().nullable(),
			preferredInstitutions: yup.string().nullable(),
			intakeSession: yup.string().nullable(),
			reasonForImmigration: yup.string().nullable(),
			financialSupport: yup.string().nullable(),
			sponsorDetails: yup.string().nullable(),
			scholarships: yup.string().nullable(),
		})
		.required(),
	yup
		.object({
			communicationMode: yup.string().nullable(),
			preferredContactTime: yup.string().nullable(),
			notes: yup.string().nullable(),
			leadSource: yup.string().nullable(),
			referralContact: yup.string().nullable(),
			leadStatus: yup.string().nullable(),
			assignedAgent: yup.string().nullable(),
			followUpDates: yup.date(),
			leadRating: yup.string().nullable(),
			leadNotes: yup.string().nullable(),
		})
		.required(),
]

const AddLead = () => {
	const { createLead, visaCategories } = useCreateLead()
	const [step, setStep] = useState(1)
	const [collectedData, setCollectedData] = useState<CollectedData>({})
	const [selectedVisaCategory, setSelectedVisaCategory] = useState<VisaCategory | null>(null)
	const currentSchema: yup.ObjectSchema<any> = stepSchemas[step - 1] || yup.object().shape({});

	const methods = useForm({
		resolver: yupResolver(currentSchema),
		mode: 'onTouched',
		defaultValues: collectedData,
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = methods

	useEffect(() => {
		const fetchSavedData = async () => {
			const { value: savedStep } = await Preferences.get({ key: 'currentStep' })
			const { value: savedData } = await Preferences.get({ key: 'formData' })
			if (savedStep) setStep(JSON.parse(savedStep))
			if (savedData) {
				const data = JSON.parse(savedData)
				setCollectedData(data)
				Object.keys(data).forEach((key) => {
					setValue(key, data[key])
				})
			}
		}
		fetchSavedData()
	}, [setValue])

	useEffect(() => {
		Preferences.set({ key: 'currentStep', value: JSON.stringify(step) })
	}, [step])

	useEffect(() => {
		Preferences.set({ key: 'formData', value: JSON.stringify(collectedData) })
	}, [collectedData])

	const handleNext = (data: any) => {
		const newData = { ...collectedData, ...data }
		const orderedData = reorderData(newData, fieldOrder)
		setCollectedData(orderedData)

		if (step < stepSchemas.length + 1) {
			setStep(step + 1)
		} else {
			onSubmit(orderedData)
		}
	}

	const handleBack = () => {
		setStep(step - 1)
	}

	const handleSelect = (option: VisaCategory | null) => {
		setSelectedVisaCategory(option)
	}

	function capitalizeFirstLetter(str) {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	const onSubmit = async (data: any) => {
		const finalData = { ...collectedData, ...data }
		const formData = new FormData();
		const visaCategory: any = selectedVisaCategory ? selectedVisaCategory.value : null;
		formData.append("visaCategory", visaCategory);
		Object.keys(finalData).forEach(key => {
			if (finalData[key] instanceof FileList && finalData[key].length > 0) {
				formData.append(key, finalData[key][0]);
			} else if (finalData[key] instanceof Date) {
				formData.append(key, finalData[key].toISOString());
			} else {
				formData.append(key, finalData[key]);
			}
		});
		const submitFlag = await createLead(formData)
		if(submitFlag){
			reset()
			setSelectedVisaCategory(null)
			setCollectedData({})
			setStep(1)
			await Preferences.remove({ key: 'currentStep' })
			await Preferences.remove({ key: 'formData' })
		}
	}

	const printRef = useRef<HTMLDivElement>(null);
	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Add Lead" subName="Leads" />
			<Row>
				<Col md={12}>
					<Card>
						<Card.Header>
							<Card.Title>Add New Lead</Card.Title>
						</Card.Header>
						<Card.Body>
							<Stepper
								activeStep={step - 1}
								styleConfig={{
									activeBgColor: '#007bff',
									completedBgColor: '#28a745',
									activeTextColor: '#ffffff',
									completedTextColor: '#ffffff',
									inactiveBgColor: '#e0e0e0',
									inactiveTextColor: '#333333',
									size: '2.5em',
									circleFontSize: '1rem',
									labelFontSize: '0.875rem',
									borderRadius: '50%',
									connectorColor: '#cccccc',
									fontWeight: 'bold',
								}}>
								<Step label="Personal Details" />
								<Step label="Academic Details" />
								<Step label="Immigration Details" />
								<Step label="Final Details" />
								<Step label="View Lead Details" />
							</Stepper>

							<FormProvider {...methods}>
								<Form className="form-step-container" onSubmit={handleSubmit(handleNext)}>
									{step === 1 && (
										<>
											<FormInput
												label="First Name"
												name="firstname"
												type="text"
												placeholder="Enter First Name"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Last Name"
												name="lastname"
												type="text"
												placeholder="Enter Last Name"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Email Address"
												name="email"
												type="email"
												placeholder="Enter Email"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Phone"
												name="phone"
												type="tel"
												placeholder="Enter Phone"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Gender"
												name="gender"
												type="text"
												placeholder="Enter Gender"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Date of Birth"
												name="dob"
												type="date"
												placeholder="Select Date of Birth"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Nationality"
												name="nationality"
												type="text"
												placeholder="Enter Nationality"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Marital Status"
												name="maritalStatus"
												type="text"
												placeholder="Enter Marital Status"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Passport Number"
												name="passportNumber"
												type="text"
												placeholder="Enter Passport Number"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Passport Expiry Date"
												name="passportExpiry"
												type="date"
												placeholder="Enter Passport Expiry Date"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Current Address"
												name="currentAddress"
												type="text"
												placeholder="Enter Current Address"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Permanent Address"
												name="permanentAddress"
												type="text"
												placeholder="Enter Permanent Address"
												register={register}
												errors={errors}
											/>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
											<Button variant="primary m-2" type="submit">
												Next
											</Button>
										</>
									)}
									{step === 2 && (
										<>
											<FormInput
												label="Highest Qualification"
												name="highestQualification"
												type="text"
												placeholder="Enter Highest Qualification"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Field of Study"
												name="fieldOfStudy"
												type="text"
												placeholder="Enter Field of Study"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Institution Name"
												name="institutionName"
												type="text"
												placeholder="Enter Institution Name"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Graduation Year"
												name="graduationYear"
												type="text"
												placeholder="Enter Graduation Year"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Grade/Percentage/CGPA"
												name="grade"
												type="text"
												placeholder="Enter Grade/Percentage/CGPA"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Test Type"
												name="testType"
												type="text"
												placeholder="Enter Test Type"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Test Score"
												name="testScore"
												type="text"
												placeholder="Enter Test Score"
												register={register}
												errors={errors}
											/>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
											<Button variant="primary m-2" type="submit">
												Next
											</Button>
										</>
									)}
									{step === 3 && (
										<>
											<Form.Group>
												<Form.Label>Choose Visa Category</Form.Label>
												<Select
													className="select2 z-3"
													options={visaCategories as any[]}
													getOptionLabel={(e: any) => e.label}
													getOptionValue={(e: any) => e.value}
													value={selectedVisaCategory}
													onChange={handleSelect}
													isClearable={true}
												/>
											</Form.Group>
											<FormInput
												label="Country of Interest"
												name="countryOfInterest"
												type="text"
												placeholder="Enter Country of Interest"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Course of Interest"
												name="courseOfInterest"
												type="text"
												placeholder="Enter Course of Interest"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Desired Field of Study"
												name="desiredFieldOfStudy"
												type="text"
												placeholder="Enter Desired Field of Study"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Preferred Institutions"
												name="preferredInstitutions"
												type="text"
												placeholder="Enter Preferred Institutions"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Intake Session"
												name="intakeSession"
												type="text"
												placeholder="Enter Intake Session"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Reason for Immigration"
												name="reasonForImmigration"
												type="text"
												placeholder="Enter Reason for Immigration"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Financial Support"
												name="financialSupport"
												type="text"
												placeholder="Enter Financial Support"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Sponsor Details"
												name="sponsorDetails"
												type="text"
												placeholder="Enter Sponsor Details"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Scholarships/Grants"
												name="scholarships"
												type="text"
												placeholder="Enter Scholarships/Grants"
												register={register}
												errors={errors}
											/>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
											<Button variant="primary m-2" type="submit">
												Next
											</Button>
										</>
									)}
									{step === 4 && (
										<>
											<FormInput
												label="Preferred Mode of Communication"
												name="communicationMode"
												type="text"
												placeholder="Enter Preferred Mode of Communication"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Preferred Time for Contact"
												name="preferredContactTime"
												type="text"
												placeholder="Enter Preferred Time for Contact"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Notes/Comments"
												name="notes"
												type="text"
												placeholder="Enter Notes/Comments"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Source of Lead"
												name="leadSource"
												type="text"
												placeholder="Enter Source of Lead"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Referral Name/Contact"
												name="referralContact"
												type="text"
												placeholder="Enter Referral Name/Contact"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Lead Status"
												name="leadStatus"
												type="text"
												placeholder="Enter Lead Status"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Assigned Agent/Counselor"
												name="assignedAgent"
												type="text"
												placeholder="Enter Assigned Agent/Counselor"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Follow-up Dates"
												name="followUpDates"
												type="date"
												placeholder="Enter Follow-up Dates"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Lead Rating"
												name="leadRating"
												type="text"
												placeholder="Enter Lead Rating"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Lead Notes"
												name="leadNotes"
												type="text"
												placeholder="Enter Lead Notes"
												register={register}
												errors={errors}
											/>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
											<Button variant="primary m-2" type="submit">
												Next
											</Button>
										</>
									)}
									{step === 5 && (
										<>
											<div ref={printRef}>
												<Table striped bordered hover>
													<thead>
														<tr>
															<th>Field Name</th>
															<th>Field Value</th>
														</tr>
													</thead>
													<tbody>
														{Object.keys(collectedData).map((key) => (
															<tr key={key}>
																<td>{capitalizeFirstLetter(key)}</td>
																<td>{String(collectedData[key])}</td>
															</tr>
														))}
														<tr>
															<td>Visa Category</td>
															<td>{selectedVisaCategory?.value}</td>
														</tr>
													</tbody>
												</Table>
											</div>
											<Button variant="success" className="m-2" type="button" onClick={() => onSubmit(collectedData)}>
												Submit
											</Button>
											<ReactToPrint
												trigger={() => <Button className="m-2" variant="secondary">Print</Button>}
												content={() => printRef.current}
											/>
											{step > 1 && (
												<Button variant="secondary" className="m-2" type="button" onClick={handleBack}>
													Back
												</Button>
											)}
										</>
									)}
								</Form>
							</FormProvider>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddLead
