import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FormInput, PageBreadcrumb } from '@/components';
import { Stepper, Step } from 'react-form-stepper';
import Select from 'react-select';
import styles from './AddLead.module.css';
import useCreateLead from './useCreateLeadForm';
import CountryList from 'react-select-country-list';
import ReactToPrint from 'react-to-print';
import { Country, State, City } from 'country-state-city';
import { capitalizeFirstLetter, nationalityOptions, genderOptions, maritalStatusOptions, customStyles } from '@/utils';
import { useThemeContext } from '@/common';

interface CollectedData {
  [key: string]: any;
}

interface DropdownOptions {
  value: string;
  label: string;
}

const defaultGender = { value: 'male', label: 'Male' };
const defaultNationality = { value: 'indian', label: 'Indian' };
const defaultCountryOfInterest = { value: 'IN', label: 'India' };
const defaultVisaCategory = { value: 'tourist visa', label: 'Tourist Visa' };
const defaultMaritalStatus = { value: 'single', label: 'Single' };

const fieldOrder = [
  'firstname', 'lastname', 'email', 'phone', 'gender', 'dob', 'nationality',
  'maritalStatus', 'passportNumber', 'passportExpiry', 'pincode', 'currentAddress',
  'permanentAddress', 'highestQualification', 'fieldOfStudy', 'institutionName',
  'graduationYear', 'grade', 'testType', 'testScore', 'countryOfInterest',
  'courseOfInterest', 'desiredFieldOfStudy', 'preferredInstitutions',
  'intakeSession', 'reasonForImmigration', 'financialSupport', 'sponsorDetails',
  'scholarships',
  'visaExpiryDate', 'visaType', 'previousStudyAbroad', 'previousVisaApplications',
  'leadRating', 'followUpDates',
  'referralContact', 'leadSource', 'preferredContactTime', 'communicationMode'
];

const reorderData = (data: any, order: any) => {
  const orderedData: CollectedData = {};
  order.forEach((key: any) => {
    if (data.hasOwnProperty(key)) {
      orderedData[key] = data[key];
    }
  });
  return orderedData;
};

const stepSchemas = [
  yup
    .object({
      firstname: yup.string().required('Please enter your First Name').trim(),
      lastname: yup.string().required('Please enter your Last Name').trim(),
      email: yup.string().required('Please enter your Email').email('Please enter a valid Email'),
      phone: yup.string().required('Please enter your Phone Number'),
      dob: yup.string().required('Please select your Date of Birth'),
      maritalStatus: yup.string(),
      pincode: yup.string().nullable().matches(/(^$)|^[0-9]{6}$/, 'Pincode must be exactly 6 digits').trim(),
      currentAddress: yup.string().required('Please enter your Current Address').trim(),
      permanentAddress: yup.string().required('Please enter your Permanent Address').trim(),
    })
    .required(),
  yup
    .object({
      highestQualification: yup.string().required('Please enter your Highest Qualification').trim(),
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
      passportNumber: yup.string().nullable().matches(/(^$)|(^[A-PR-WYa-pr-wy][0-9]\d\s?\d{4}[0-9]$)/, 'Passport number must be exactly 8 characters').trim(),
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
      leadSource: yup.string().nullable(),
      referralContact: yup.string().nullable(),
      followUpDates: yup.string().required('Please select the Follow Ups Date'),
      leadRating: yup.string().nullable(),
    })
    .required(),
];

const AddLead = () => {
  const { settings } = useThemeContext();
  const [countryOptions, setCountryOptions] = useState(() => CountryList().getData());
  const { createLead, visaCategories } = useCreateLead();
  const [step, setStep] = useState(1);
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [selectedVisaCategory, setSelectedVisaCategory] = useState<DropdownOptions | null>(defaultVisaCategory);
  const [selectedGender, setSelectedGender] = useState<DropdownOptions | null>(defaultGender);
  const [selectNationalityOptions, setNationalityOptions] = useState<DropdownOptions | null>(defaultNationality);
  const [selectedCountryOfInterest, setSelectedCountryOfInterest] = useState<DropdownOptions | null>(defaultCountryOfInterest);
  const [countries, setCountries] = useState<DropdownOptions[]>([]);
  const [states, setStates] = useState<DropdownOptions[]>([]);
  const [cities, setCities] = useState<DropdownOptions[]>([]);
  const [districts, setDistricts] = useState<DropdownOptions[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<DropdownOptions | null>(null);
  const [selectedState, setSelectedState] = useState<DropdownOptions | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DropdownOptions | null>(null);
  const [selectedCity, setSelectedCity] = useState<DropdownOptions | null>(null);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<DropdownOptions | null>(defaultMaritalStatus);
  const [phoneValue, setPhoneValue] = useState<string>("");

  const today = new Date();
  const maxPassportExpiryDate = new Date(today.getFullYear() + 20, today.getMonth(), today.getDate());

  const currentSchema: yup.ObjectSchema<any> = stepSchemas[step - 1] || yup.object().shape({});
  const methods = useForm({
    resolver: yupResolver(currentSchema),
    mode: 'onTouched',
    defaultValues: collectedData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  useEffect(() => {
    const countryOptions = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries(countryOptions);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const stateOptions = State.getStatesOfCountry(selectedCountry.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));
      setStates(stateOptions);
      setDistricts([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const districtOptions = City.getCitiesOfState(selectedCountry.value, selectedState.value).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setDistricts(districtOptions);
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  useEffect(() => {
    if (selectedDistrict) {
      const cityOptions = City.getCitiesOfState(selectedCountry?.value || '', selectedState?.value || '').map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities(cityOptions);
    }
  }, [selectedDistrict, selectedState, selectedCountry]);

  useEffect(() => {
    const fetchSavedData = async () => {
      const savedStep = sessionStorage.getItem('currentStep');
      const savedData = sessionStorage.getItem('formData');
      const savedGenderOption = sessionStorage.getItem('selectedGender');
      const savedVisaCategoryOption = sessionStorage.getItem('selectedVisaCategory');
      const savedNationalityOption = sessionStorage.getItem('selectedNationality');
      const savedCountryOfInterestOption = sessionStorage.getItem('selectedCountryOfInterest');
      const savedCountryOption = sessionStorage.getItem('selectedCountry');
      const savedStateOption = sessionStorage.getItem('selectedState');
      const savedDistrictOption = sessionStorage.getItem('selectedDistrict');
      const savedCityOption = sessionStorage.getItem('selectedCity');
      const savedStatusOption = sessionStorage.getItem('selectedStatus');

      if (savedStep) setStep(JSON.parse(savedStep));
      if (savedData) {
        const data = JSON.parse(savedData);
        setCollectedData(data);
        Object.keys(data).forEach((key) => {
          setValue(key, data[key]);
        });
        if (savedGenderOption) {
          setSelectedGender(JSON.parse(savedGenderOption));
        }
        if (savedVisaCategoryOption) {
          setSelectedVisaCategory(JSON.parse(savedVisaCategoryOption));
        }
        if (savedNationalityOption) {
          setNationalityOptions(JSON.parse(savedNationalityOption));
        }
        if (savedStatusOption) {
          setSelectedMaritalStatus(JSON.parse(savedStatusOption));
        }
        if (savedCountryOfInterestOption) {
          setSelectedCountryOfInterest(JSON.parse(savedCountryOfInterestOption));
        }
        if (savedCountryOption) {
          const country = JSON.parse(savedCountryOption);
          setSelectedCountry(country);
          const stateOptions = State.getStatesOfCountry(country.value).map((state) => ({
            value: state.isoCode,
            label: state.name,
          }));
          setStates(stateOptions);
          if (savedStateOption) {
            const state = JSON.parse(savedStateOption);
            setSelectedState(state);
            const districtOptions = City.getCitiesOfState(country.value, state.value).map((city) => ({
              value: city.name,
              label: city.name,
            }));
            setDistricts(districtOptions);
            if (savedDistrictOption) {
              const district = JSON.parse(savedDistrictOption);
              setSelectedDistrict(district);
              const cityOptions = City.getCitiesOfState(country.value, state.value).map((city) => ({
                value: city.name,
                label: city.name,
              }));
              setCities(cityOptions);
              if (savedCityOption) {
                setSelectedCity(JSON.parse(savedCityOption));
              }
            }
          }
        }
      }
    };
    fetchSavedData();
  }, [setValue]);

  useEffect(() => {
    sessionStorage.setItem('currentStep', JSON.stringify(step));
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('formData', JSON.stringify(collectedData));
  }, [collectedData]);

  const handleNext = (data: any) => {
    const newData = { ...collectedData, ...data };
    const orderedData = reorderData(newData, fieldOrder);
    setCollectedData(orderedData);

    if (step < stepSchemas.length + 1) {
      setStep(step + 1);
    } else {
      onSubmit(orderedData);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSelect = (option: DropdownOptions | null) => {
    setSelectedVisaCategory(option);
    sessionStorage.setItem('selectedVisaCategory', JSON.stringify(option));
  };

  const handleSelect2 = (option: DropdownOptions | null) => {
    setSelectedGender(option);
    sessionStorage.setItem('selectedGender', JSON.stringify(option));
  };

  const handleSelect3 = (option: DropdownOptions | null) => {
    setNationalityOptions(option);
    sessionStorage.setItem('selectedNationality', JSON.stringify(option));
  };

  const handleSelect4 = (option: DropdownOptions | null) => {
    setSelectedCountryOfInterest(option);
    sessionStorage.setItem('selectedCountryOfInterest', JSON.stringify(option));
  };

  const handleSelect5 = (option: DropdownOptions | null) => {
    setSelectedCountry(option);
    sessionStorage.setItem('selectedCountry', JSON.stringify(option));
  };

  const handleSelect6 = (option: DropdownOptions | null) => {
    setSelectedState(option);
    sessionStorage.setItem('selectedState', JSON.stringify(option));
  };

  const handleSelect7 = (option: DropdownOptions | null) => {
    setSelectedDistrict(option);
    sessionStorage.setItem('selectedDistrict', JSON.stringify(option));
  };

  const handleSelect8 = (option: DropdownOptions | null) => {
    setSelectedCity(option);
    sessionStorage.setItem('selectedCity', JSON.stringify(option));
  };

  const handleSelect9 = (option: DropdownOptions | null) => {
    setSelectedMaritalStatus(option);
    sessionStorage.setItem('selectedStatus', JSON.stringify(option));
  };

  const onSubmit = async (data: any) => {
    const finalData = { ...collectedData, ...data };
    const formData = new FormData();
    const country: any = selectedCountry ? selectedCountry.label : null;
    const state: any = selectedState ? selectedState.label : null;
    const district: any = selectedDistrict ? selectedDistrict.value : null;
    const city: any = selectedCity ? selectedCity.value : null;
    const visaCategory: any = selectedVisaCategory ? selectedVisaCategory.value : null;
    const gender: any = selectedGender ? selectedGender.value : null;
    const nationality: any = selectNationalityOptions ? selectNationalityOptions.value : null;
    const countryOfInterest: any = selectedCountryOfInterest ? selectedCountryOfInterest.label : null;
    const maritalStatus: any = selectedMaritalStatus ? selectedMaritalStatus.label : null;

    formData.append('country', country);
    formData.append('state', state);
    formData.append('district', district);
    formData.append('city', city);
    formData.append('visaCategory', visaCategory);
    formData.append('gender', gender);
    formData.append('nationality', nationality);
    formData.append('countryOfInterest', countryOfInterest);
    formData.append('maritalStatus', maritalStatus);
    formData.append('phone', phoneValue);

    Object.keys(finalData).forEach(key => {
      if (finalData[key] instanceof FileList && finalData[key].length > 0) {
        formData.append(key, finalData[key][0]);
      } else if (finalData[key] instanceof Date) {
        formData.append(key, finalData[key].toISOString());
      } else {
        formData.append(key, finalData[key]);
      }
    });
    const submitFlag = await createLead(formData);
    if (submitFlag) {
      reset();
      setSelectedVisaCategory(null);
      setSelectedGender(null);
      setNationalityOptions(null);
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedCity(null);
      setSelectedCountryOfInterest(null);
      setPhoneValue("")
      setCollectedData({});
      setStep(1);
      sessionStorage.removeItem('currentStep');
      sessionStorage.removeItem('formData');
      sessionStorage.removeItem('selectedGender');
      sessionStorage.removeItem('selectedVisaCategory');
      sessionStorage.removeItem('selectedNationality');
      sessionStorage.removeItem('selectedCountryOfInterest');
      sessionStorage.removeItem('selectedCountry');
      sessionStorage.removeItem('selectedState');
      sessionStorage.removeItem('selectedDistrict');
      sessionStorage.removeItem('selectedCity');
      sessionStorage.removeItem('selectedStatus');
    }
  };

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
                className={styles.customStepperStyle}
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
                }}
              >
                <Step label="Personal Details" />
                <Step label="Academic Details" />
                <Step label="Immigration Details" />
                <Step label="Final Details" />
                <Step label="View Lead Details" />
              </Stepper>

              <FormProvider {...methods}>
                <Form className={styles.formStepContainer} onSubmit={handleSubmit(handleNext)}>
                  {step === 1 && (
                    <>
                      <Row className={`${styles.customMargin}`}>
                        <Col md={6}>
                          <FormInput
                            label="First Name"
                            name="firstname"
                            type="text"
                            placeholder="John"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                        <Col md={6}>
                          <FormInput
                            label="Last Name"
                            name="lastname"
                            type="text"
                            placeholder="Doe"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col md={4}>
                          <FormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="example@example.com"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                        <Col md={4}>
                          <FormInput
                            label="Phone"
                            name="phone"
                            type="phone"
                            placeholder="9876543210"
                            value={phoneValue}
                            register={register}
                            errors={errors}
                            refCallback={(value: string) => setPhoneValue(value)}
                          />
                        </Col>
                        <Col md={4}>
                          <FormInput
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            placeholder="Select Date of Birth"
                            register={register}
                            errors={errors}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </Col>
                      </Row>
                      <Row className={styles.customMargin}>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Gender</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={genderOptions}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedGender}
                              onChange={handleSelect2}
                              isClearable={true}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Nationality</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={nationalityOptions}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectNationalityOptions}
                              onChange={handleSelect3}
                              isClearable={true}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Marital Status</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={maritalStatusOptions}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedMaritalStatus}
                              onChange={handleSelect9}
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
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={countries}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedCountry}
                              onChange={handleSelect5}
                              isClearable={true}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>State</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={states}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedState}
                              onChange={handleSelect6}
                              isClearable={true}
                              isDisabled={!selectedCountry}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>District</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={districts}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedDistrict}
                              onChange={handleSelect7}
                              isClearable={true}
                              isDisabled={!selectedState}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>City</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={cities}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedCity}
                              onChange={handleSelect8}
                              isClearable={true}
                              isDisabled={!selectedDistrict}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Pincode"
                            name="pincode"
                            type="text"
                            placeholder="123456"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Current Address"
                            name="currentAddress"
                            type="text"
                            placeholder="Enter Current Address"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Permanent Address"
                            name="permanentAddress"
                            type="text"
                            placeholder="Enter Permanent Address"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      {step > 1 && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={handleBack}
                        >
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
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Highest Qualification"
                            name="highestQualification"
                            type="text"
                            placeholder="Enter Highest Qualification"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Field of Study"
                            name="fieldOfStudy"
                            type="text"
                            placeholder="Enter Field of Study"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Institution Name"
                            name="institutionName"
                            type="text"
                            placeholder="Enter Institution Name"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Graduation Year"
                            name="graduationYear"
                            type="text"
                            placeholder="Enter Graduation Year"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Grade/Percentage/CGPA"
                            name="grade"
                            type="text"
                            placeholder="Enter Grade/Percentage/CGPA"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Test Type"
                            name="testType"
                            type="text"
                            placeholder="Enter Test Type"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Test Score"
                            name="testScore"
                            type="text"
                            placeholder="Enter Test Score"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      {step > 1 && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={handleBack}
                        >
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
                      <Row className={`${styles.customMargin}`}>
                        <Col md={6}>
                          <FormInput
                            label="Passport Number"
                            name="passportNumber"
                            type="text"
                            placeholder="A12345678"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                        <Col md={6}>
                          <FormInput
                            label="Passport Expiry Date"
                            name="passportExpiry"
                            type="date"
                            placeholder="Enter Passport Expiry Date"
                            register={register}
                            errors={errors}
                            max={maxPassportExpiryDate.toISOString().split('T')[0]}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Choose Visa Category</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2 z-3"
                              options={visaCategories as any[]}
                              getOptionLabel={(e: any) => e.label}
                              getOptionValue={(e: any) => e.value}
                              value={selectedVisaCategory}
                              onChange={handleSelect}
                              isClearable={true}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Country of Interest</Form.Label>
                            <Select
                              styles={customStyles(settings.theme === "dark")}
                              className="select2"
                              options={countryOptions}
                              getOptionLabel={(e) => e.label}
                              getOptionValue={(e) => e.value}
                              value={selectedCountryOfInterest}
                              onChange={handleSelect4}
                              isClearable={true}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col md={6}>
                          <FormInput
                            label="Course of Interest"
                            name="courseOfInterest"
                            type="text"
                            placeholder="Enter Course of Interest"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                        <Col md={6}>
                          <FormInput
                            label="Desired Field of Study"
                            name="desiredFieldOfStudy"
                            type="text"
                            placeholder="Enter Desired Field of Study"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Preferred Institutions"
                            name="preferredInstitutions"
                            type="text"
                            placeholder="Enter Preferred Institutions"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Intake Session"
                            name="intakeSession"
                            type="text"
                            placeholder="Enter Intake Session"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Reason for Immigration"
                            name="reasonForImmigration"
                            type="text"
                            placeholder="Enter Reason for Immigration"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Financial Support"
                            name="financialSupport"
                            type="text"
                            placeholder="Enter Financial Support"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Sponsor Details"
                            name="sponsorDetails"
                            type="text"
                            placeholder="Enter Sponsor Details"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Scholarships/Grants"
                            name="scholarships"
                            type="text"
                            placeholder="Enter Scholarships/Grants"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      {step > 1 && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={handleBack}
                        >
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
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Preferred Mode of Communication"
                            name="communicationMode"
                            type="text"
                            placeholder="Enter Preferred Mode of Communication"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Preferred Time for Contact"
                            name="preferredContactTime"
                            type="text"
                            placeholder="Enter Preferred Time for Contact"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Source of Lead"
                            name="leadSource"
                            type="text"
                            placeholder="Enter Source of Lead"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Referral Name/Contact"
                            name="referralContact"
                            type="text"
                            placeholder="Enter Referral Name/Contact"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Follow-up Dates"
                            name="followUpDates"
                            type="date"
                            placeholder="Enter Follow-up Dates"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      <Row className={`${styles.customMargin}`}>
                        <Col>
                          <FormInput
                            label="Lead Rating"
                            name="leadRating"
                            type="text"
                            placeholder="Enter Lead Rating"
                            register={register}
                            errors={errors}
                          />
                        </Col>
                      </Row>
                      {step > 1 && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={handleBack}
                        >
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
                      <div ref={printRef} className={styles.customStepperStyle}>
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
                              <td>Phone</td>
                              <td>{phoneValue}</td>
                            </tr>
                            <tr>
                              <td>Gender</td>
                              <td>{capitalizeFirstLetter(String(selectedGender?.value))}</td>
                            </tr>
                            <tr>
                              <td>Nationality</td>
                              <td>{capitalizeFirstLetter(String(selectNationalityOptions?.value))}</td>
                            </tr>
                            <tr>
                              <td>Country</td>
                              <td>{selectedCountry?.label === undefined ? "" : capitalizeFirstLetter(String(selectedCountry?.label))}</td>
                            </tr>
                            <tr>
                              <td>State</td>
                              <td>{selectedState?.label === undefined ? "" : capitalizeFirstLetter(String(selectedState?.label))}</td>
                            </tr>
                            <tr>
                              <td>District</td>
                              <td>{selectedDistrict?.value === undefined ? "" : capitalizeFirstLetter(String(selectedDistrict?.value))}</td>
                            </tr>
                            <tr>
                              <td>City</td>
                              <td>{selectedCity?.value === undefined ? "" : capitalizeFirstLetter(String(selectedCity?.value))}</td>
                            </tr>
                            <tr>
                              <td>Country of Interest</td>
                              <td>{selectedCountryOfInterest?.label === undefined ? "" : capitalizeFirstLetter(String(selectedCountryOfInterest?.label))}</td>
                            </tr>
                            <tr>
                              <td>Visa Category</td>
                              <td>{selectedVisaCategory?.value === undefined ? "" : capitalizeFirstLetter(String(selectedVisaCategory?.value))}</td>
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
  );
};

export default AddLead;
