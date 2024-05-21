import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Row, Col, Card, Form, Button } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FormInput, PageBreadcrumb } from '@/components'
import { Stepper, Step } from 'react-form-stepper'
import './AddLead.css'
import useCreateLead from './useCreateLeadForm'
import { Preferences } from '@capacitor/preferences'

// Define validation schemas for each step
const stepSchemas = [
	yup
		.object({
			firstname: yup.string().required('Please enter your First Name'),
			lastname: yup.string().required('Please enter your Last Name'),
			email: yup
				.string()
				.required('Please enter your Email')
				.email('Please enter a valid Email'),
			phone: yup.string().required('Please enter your Phone Number'),
			gender: yup.string().required('Please select your Gender'),
			dob: yup.date().required('Please select your Date of Birth'),
			nationality: yup.string().required('Please enter your Nationality'),
			maritalStatus: yup.string().required('Please select your Marital Status'),
			passportNumber: yup
				.string()
				.required('Please enter your Passport Number'),
			passportExpiry: yup
				.date()
				.required('Please enter your Passport Expiry Date'),
			currentAddress: yup
				.string()
				.required('Please enter your Current Address'),
			permanentAddress: yup
				.string()
				.required('Please enter your Permanent Address'),
		})
		.required(),
	yup
		.object({
			highestQualification: yup
				.string()
				.required('Please enter your Highest Qualification'),
			fieldOfStudy: yup.string().required('Please enter your Field of Study'),
			institutionName: yup
				.string()
				.required('Please enter your Institution Name'),
			graduationYear: yup
				.string()
				.required('Please enter your Year of Graduation'),
			grade: yup.string().required('Please enter your Grade/Percentage/CGPA'),
			testType: yup.string().required('Please select your Test Type'),
			testScore: yup.string().required('Please enter your Test Score'),
		})
		.required(),
	yup
		.object({
			countryOfInterest: yup
				.string()
				.required('Please select your Country of Interest'),
			courseOfInterest: yup
				.string()
				.required('Please enter your Course of Interest'),
			desiredFieldOfStudy: yup
				.string()
				.required('Please enter your Desired Field of Study'),
			preferredInstitutions: yup
				.string()
				.required('Please enter your Preferred Institutions'),
			intakeSession: yup.string().required('Please select your Intake Session'),
			reasonForImmigration: yup
				.string()
				.required('Please enter your Reason for Immigration'),
			financialSupport: yup
				.string()
				.required('Please select your Financial Support'),
			sponsorDetails: yup
				.string()
				.required('Please enter your Sponsor Details'),
			proofOfFunds: yup.mixed().required('Please upload Proof of Funds'),
			scholarships: yup
				.string()
				.required('Please enter your Scholarships/Grants details'),
		})
		.required(),
	yup
		.object({
			previousVisaApplications: yup
				.string()
				.required('Please select your Previous Visa Applications'),
			previousStudyAbroad: yup
				.string()
				.required('Please enter your Previous Study Abroad Experience'),
			visaType: yup.string().required('Please select your Visa Type'),
			visaExpiryDate: yup
				.date()
				.required('Please select your Visa Expiry Date'),
			resume: yup.mixed().required('Please upload your Resume/CV'),
			recommendationLetter: yup
				.mixed()
				.required('Please upload your Letter of Recommendation'),
			sop: yup.mixed().required('Please upload your Statement of Purpose'),
			transcripts: yup.mixed().required('Please upload your Transcripts'),
			certificates: yup.mixed().required('Please upload your Certificates'),
			passportCopy: yup.mixed().required('Please upload your Passport Copy'),
			languageTestReport: yup
				.mixed()
				.required('Please upload your Language Test Report'),
		})
		.required(),
	yup
		.object({
			communicationMode: yup
				.string()
				.required('Please select your Preferred Mode of Communication'),
			preferredContactTime: yup
				.string()
				.required('Please select your Preferred Time for Contact'),
			notes: yup
				.string()
				.required('Please enter any additional Notes/Comments'),
			leadSource: yup.string().required('Please select your Source of Lead'),
			referralContact: yup
				.string()
				.required('Please enter Referral Name/Contact'),
			leadStatus: yup.string().required('Please select Lead Status'),
			assignedAgent: yup
				.string()
				.required('Please select Assigned Agent/Counselor'),
			followUpDates: yup.date().required('Please select Follow-up Dates'),
			leadRating: yup.string().required('Please select Lead Rating'),
			leadNotes: yup.string().required('Please enter Lead Notes'),
		})
		.required(),
]

const AddLead = () => {
	const { createLead } = useCreateLead()
	const [step, setStep] = useState(1)
	const [collectedData, setCollectedData] = useState({})

	const currentSchema = stepSchemas[step - 1] || yup.object().shape({})

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
		getValues,
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
		setCollectedData(newData)

		if (step < stepSchemas.length) {
			setStep(step + 1)
		} else {
			onSubmit(newData)
		}
	}

	const handleBack = () => {
		setStep(step - 1)
	}

	const onSubmit = async (data: any) => {
		const finalData = { ...collectedData, ...data }
		console.log('Final data:', finalData)
		createLead(finalData)
		reset()
		setCollectedData({})
		setStep(1)
		await Preferences.remove({ key: 'currentStep' })
		await Preferences.remove({ key: 'formData' })
	}

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
								<Step label="Document Details" />
								<Step label="Final Details" />
							</Stepper>

							<FormProvider {...methods}>
								<Form
									className="form-step-container"
									onSubmit={handleSubmit(handleNext)}>
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
											<Button variant="primary" type="submit">
												Next
											</Button>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
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
											<Button variant="primary" type="submit">
												Next
											</Button>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
										</>
									)}
									{step === 3 && (
										<>
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
												label="Proof of Funds"
												name="proofOfFunds"
												type="file"
												placeholder="Upload Proof of Funds"
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
											<Button variant="primary" type="submit">
												Next
											</Button>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
										</>
									)}
									{step === 4 && (
										<>
											<FormInput
												label="Previous Visa Applications"
												name="previousVisaApplications"
												type="text"
												placeholder="Enter Previous Visa Applications"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Previous Study Abroad Experience"
												name="previousStudyAbroad"
												type="text"
												placeholder="Enter Previous Study Abroad Experience"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Visa Type"
												name="visaType"
												type="text"
												placeholder="Enter Visa Type"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Visa Expiry Date"
												name="visaExpiryDate"
												type="date"
												placeholder="Enter Visa Expiry Date"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Resume/CV"
												name="resume"
												type="file"
												placeholder="Upload Resume/CV"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Letter of Recommendation"
												name="recommendationLetter"
												type="file"
												placeholder="Upload Letter of Recommendation"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Statement of Purpose"
												name="sop"
												type="file"
												placeholder="Upload Statement of Purpose"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Transcripts"
												name="transcripts"
												type="file"
												placeholder="Upload Transcripts"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Certificates"
												name="certificates"
												type="file"
												placeholder="Upload Certificates"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Passport Copy"
												name="passportCopy"
												type="file"
												placeholder="Upload Passport Copy"
												register={register}
												errors={errors}
											/>
											<FormInput
												label="Language Test Report"
												name="languageTestReport"
												type="file"
												placeholder="Upload Language Test Report"
												register={register}
												errors={errors}
											/>
											<Button variant="primary" type="submit">
												Next
											</Button>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
													Back
												</Button>
											)}
										</>
									)}
									{step === 5 && (
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
											<Button
												variant="success"
												type="button"
												onClick={() => onSubmit(collectedData)}>
												Submit
											</Button>
											{step > 1 && (
												<Button
													variant="secondary"
													type="button"
													onClick={handleBack}>
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
