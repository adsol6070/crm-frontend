import { FormInput, PageBreadcrumb } from '@/components'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Step, Stepper } from 'react-form-stepper'
import { Controller, useForm } from 'react-hook-form'
import { ToastContainer } from 'react-toastify'
import { step1Schema, step2Schema } from './validationSchemas'
import styles from './AddLead.module.css'
import Select from 'react-select'
import {
	customStyles,
	genderOptions,
	maritalStatusOptions,
	nationalityOptions,
} from '@/utils'
import { useThemeContext } from '@/common'

interface Option {
	value: string
	label: string
}

const AddLead = () => {
	const { settings } = useThemeContext()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [selectedGender, setSelectedGender] = useState<Option | null>({
		value: 'male',
		label: 'Male',
	})
	const [selectNationalityOptions, setNationalityOptions] =
		useState<Option | null>({ value: 'indian', label: 'Indian' })
	const [selectedMaritalStatus, setSelectedMaritalStatus] =
		useState<Option | null>({ value: 'single', label: 'Single' })

	const [selectedCountry, setSelectedCountry] = useState<Option | null>(null)
	const [selectedState, setSelectedState] = useState<Option | null>(null)
	const [selectedDistrict, setSelectedDistrict] = useState<Option | null>(null)
	const [selectedCity, setSelectedCity] = useState<Option | null>(null)
	const [countries, setCountries] = useState<Option[]>([])
	const [states, setStates] = useState<Option[]>([])
	const [cities, setCities] = useState<Option[]>([])
	const [districts, setDistricts] = useState<Option[]>([])

	const schemas = [step1Schema, step2Schema]
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schemas[currentStep - 1]),
		defaultValues: {
			firstname: '',
			lastname: '',
			// email: '',
			// phone: '',
			// dob: '',
			// maritalStatus: '',
			// pincode: '',
			// currentAddress: '',
			// permanentAddress: '',
			// highestQualification: '',
			// fieldOfStudy: '',
			// institutionName: '',
			// graduationYear: '',
			// grade: '',
			// testType: '',
			// testScore: '',
		},
	})

	console.log('Errors:', errors)
	const onSubmit = (data: any) => {
		console.log('On Submit get called.')
		if (currentStep === 1) {
			setCurrentStep(2)
		} else {
			console.log('Form Data:', data)
		}
	}

	const handleBack = () => {
		setCurrentStep(currentStep - 1)
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
								className={styles.customStepperStyle}
								activeStep={currentStep - 1}
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

							<Form onSubmit={handleSubmit(onSubmit)}>
								{currentStep === 1 && (
									<>
										<Row className={`${styles.customMargin}`}>
											<Col md={6}>
												<Controller
													name="firstname"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															errors={errors}
															placeholder="John"
															label="First Name"
														/>
													)}
												/>
											</Col>
											<Col md={6}>
												<Controller
													name="lastname"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															errors={errors}
															placeholder="Doe"
															label="Last Name"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col md={4}>
												<Controller
													name="email"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															errors={errors}
															placeholder="example@example.com"
															label="Email Address"
														/>
													)}
												/>
											</Col>
											<Col md={4}>
												<Controller
													name="phone"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															errors={errors}
															placeholder="9876543210"
															label="Phone"
															type='phone'
														/>
													)}
												/>
											</Col>
											<Col md={4}>
												<Controller
													name="dob"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.dob}
															placeholder="Select Date of Birth"
															label="Date of Birth"
															inputType="date"
														/>
													)}
												/>
											</Col>
										</Row>
										{/*
										<Row className={styles.customMargin}>
											<Col md={4}>
												<Form.Group>
													<Form.Label>Gender</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={genderOptions}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedGender}
														// onChange={handleSelect2}
														isClearable={true}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group>
													<Form.Label>Nationality</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={nationalityOptions}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectNationalityOptions}
														// onChange={handleSelect3}
														isClearable={true}
													/>
												</Form.Group>
											</Col>
											<Col md={4}>
												<Form.Group>
													<Form.Label>Marital Status</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={maritalStatusOptions}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedMaritalStatus}
														// onChange={handleSelect9}
														isClearable={true}
													/>
												</Form.Group>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col md={3}>
												<Form.Group>
													<Form.Label>Country</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={countries}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedCountry}
														// onChange={handleSelect5}
														isClearable={true}
													/>
												</Form.Group>
											</Col>
											<Col md={3}>
												<Form.Group>
													<Form.Label>State</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={states}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedState}
														// onChange={handleSelect6}
														isClearable={true}
														isDisabled={!selectedCountry}
													/>
												</Form.Group>
											</Col>
											<Col md={3}>
												<Form.Group>
													<Form.Label>District</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={districts}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedDistrict}
														// onChange={handleSelect7}
														isClearable={true}
														isDisabled={!selectedState}
													/>
												</Form.Group>
											</Col>
											<Col md={3}>
												<Form.Group>
													<Form.Label>City</Form.Label>
													<Select
														styles={customStyles(settings.theme === 'dark')}
														className="select2"
														options={cities}
														getOptionLabel={(e) => e.label}
														getOptionValue={(e) => e.value}
														value={selectedCity}
														// onChange={handleSelect8}
														isClearable={true}
														isDisabled={!selectedDistrict}
													/>
												</Form.Group>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="pincode"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.pincode}
															placeholder="123456"
															label="Pincode"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="currentAddress"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.currentAddress}
															placeholder="Enter Current Address"
															label="Current Address"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="permanentAddress"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.permanentAddress}
															placeholder="Enter Permanent Address"
															label="Permanent Address"
														/>
													)}
												/>
											</Col>
										</Row> */}
										{currentStep > 1 && (
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
								{currentStep === 2 && (
									<>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="highestQualification"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.highestQualification}
															placeholder="Enter Highest Qualification"
															label="Highest Qualification"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="fieldOfStudy"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.fieldOfStudy}
															placeholder="Enter Field of Study"
															label="Field of Study"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="institutionName"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.institutionName}
															placeholder="Enter Institution Name"
															label="Institution Name"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="graduationYear"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.graduationYear}
															placeholder="Enter Graduation Year"
															label="Graduation Year"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="grade"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.grade}
															placeholder="Enter Grade/Percentage/CGPA"
															label="Grade/Percentage/CGPA"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="testType"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.testType}
															placeholder="Enter Test Type"
															label="Test Type"
														/>
													)}
												/>
											</Col>
										</Row>
										<Row className={`${styles.customMargin}`}>
											<Col>
												<Controller
													name="testScore"
													control={control}
													render={({ field }) => (
														<FormInput
															{...field}
															error={errors.testScore}
															placeholder="Enter Test Score"
															label="Test Score"
														/>
													)}
												/>
											</Col>
										</Row>
										{currentStep > 1 && (
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
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default AddLead
