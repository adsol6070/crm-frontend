import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Col, Form, Row, Spinner, Alert, Table } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select'
import { PageBreadcrumb, FormInput } from '@/components';
import useEditLead from './useEditLead';
import useReadLead from '../Read/useReadLead';
import CountryList from 'react-select-country-list';
import { Country, State, City } from 'country-state-city';
import { LeadData } from '@/types';
import { capitalizeFirstLetter, nationalityOptions, genderOptions, customStyles } from '@/utils'
import { useThemeContext } from '@/common';

interface DropdownOptions {
  value?: string
  label?: string
}

const EditLead: React.FC = () => {
  const { settings } = useThemeContext();
  const { leadId } = useParams<{ leadId: string }>();
  const [countryOptions, setCountryOptions] = useState(() => CountryList().getData());
  const { leadData, loading, error } = useReadLead(leadId as string);
  const { editLead, visaCategories } = useEditLead();
  const [selectedVisaCategory, setSelectedVisaCategory] = useState<DropdownOptions | null>(null)
  const [selectedGender, setSelectedGender] = useState<DropdownOptions | null>(null)
  const [selectedNationality, setSelectedNationality] = useState<DropdownOptions | null>(null)
  const [selectedCountryOfInterest, setSelectedCountryOfInterest] = useState<DropdownOptions | null>(null)
  const [countries, setCountries] = useState<DropdownOptions[]>([]);
  const [states, setStates] = useState<DropdownOptions[]>([]);
  const [cities, setCities] = useState<DropdownOptions[]>([]);
  const [districts, setDistricts] = useState<DropdownOptions[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<DropdownOptions | null>(null)
  const [selectedState, setSelectedState] = useState<DropdownOptions | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<DropdownOptions | null>(null)
  const [selectedCity, setSelectedCity] = useState<DropdownOptions | null>(null)
  const [phoneVal, setPhoneVal] = useState<string>("")

  const methods = useForm({
    defaultValues: leadData ?? {},
  });

  const { register, handleSubmit, setValue, formState: { errors } } = methods;

  const getCountryISOCode = (countryName: any) => {
    const country = Country.getAllCountries().find((country) => country.name === countryName);
    return country ? country.isoCode : null;
  };


  const getStateCode = (stateName: any) => {
    const state = State.getAllStates().find((state) => state.name === stateName);
    return state ? state?.isoCode : null;
  };

  useEffect(() => {
    const countryOptions = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries(countryOptions);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const isoCode: any = getCountryISOCode(selectedCountry.label);
      if (isoCode !== selectedCountry.value) {
        setSelectedCountry({ value: isoCode, label: selectedCountry.label });
      }
      const stateOptions = State.getStatesOfCountry(isoCode).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));
      setStates(stateOptions);
      setSelectedState(selectedState);
      setSelectedDistrict(selectedDistrict);
      setSelectedCity(selectedCity);
      setDistricts([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const stateCode = getStateCode(selectedState.label);
      if (stateCode !== selectedState.value) {
        setSelectedState({ value: stateCode, label: selectedState.label });
      }
      const districtOptions = City.getCitiesOfState(selectedCountry.value, stateCode).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setDistricts(districtOptions);
      setSelectedDistrict(selectedDistrict);
      setSelectedCity(selectedCity);
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  useEffect(() => {
    if (selectedDistrict) {
      const cityOptions = City.getCitiesOfState(selectedCountry?.value ?? '', selectedState?.value ?? '').map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities(cityOptions);
      setSelectedCity(selectedCity);
    }
  }, [selectedDistrict, selectedState, selectedCountry]);


  useEffect(() => {
    if (leadData) {
      Object.keys(leadData).forEach((key) => {
        if (key.includes('Date') && leadData[key as keyof LeadData]) {
          setValue(key as keyof LeadData, new Date(leadData[key]).toLocaleDateString('en-CA'));
        } else if (key === 'dob') {
          setValue(key, leadData[key] ? new Date(leadData[key]).toLocaleDateString('en-CA') : '');
        } else if (key === 'passportExpiry') {
          setValue(key, leadData[key] ? new Date(leadData[key]).toLocaleDateString('en-CA') : '');
        } else {
          setValue(key as keyof LeadData, leadData[key as keyof LeadData]);
        }
      });
      if (leadData.phone) {
        setPhoneVal(leadData.phone)
      }

      if (leadData.gender) {
        setSelectedGender({
          label: capitalizeFirstLetter(leadData.gender),
          value: leadData.gender,
        })
      }

      if (leadData.nationality) {
        setSelectedNationality({
          label: capitalizeFirstLetter(leadData.nationality),
          value: leadData.nationality,
        })
      }
      if (leadData.country) {
        setSelectedCountry({
          label: leadData.country,
          value: leadData.country,
        })
      }

      if (leadData.state) {
        setSelectedState({
          label: leadData.state,
          value: leadData.state,
        })
      }

      if (leadData.district) {
        setSelectedDistrict({
          label: leadData.district,
          value: leadData.district,
        })
      }

      if (leadData.city) {
        setSelectedCity({
          label: leadData.city,
          value: leadData.city,
        })
      }

      if (leadData.countryOfInterest) {
        setSelectedCountryOfInterest({
          label: leadData.countryOfInterest,
          value: leadData.countryOfInterest,
        })
      }

      if (leadData.visaCategory) {
        setSelectedVisaCategory({
          label: capitalizeFirstLetter(leadData.visaCategory),
          value: leadData.visaCategory,
        })
      }
    }

  }, [leadData, setValue]);

  const handleSelect = (option: DropdownOptions | null) => {
    setSelectedVisaCategory(option)
  }

  const handleSelect2 = (option: DropdownOptions | null) => {
    setSelectedGender(option)
  }

  const handleSelect3 = (option: DropdownOptions | null) => {
    setSelectedNationality(option)
  }

  const handleSelect4 = (option: DropdownOptions | null) => {
    setSelectedCountryOfInterest(option)
  }

  const handleSelect5 = (option: DropdownOptions | null) => {
    setSelectedCountry(option)
  }

  const handleSelect6 = (option: DropdownOptions | null) => {
    setSelectedState(option)
  }

  const handleSelect7 = (option: DropdownOptions | null) => {
    setSelectedDistrict(option)
  }

  const handleSelect8 = (option: DropdownOptions | null) => {
    setSelectedCity(option)
  }


  const onSubmit = async (data: any) => {
    const completeData = {
      ...data, visaCategory: selectedVisaCategory?.value, gender: selectedGender?.value, countryOfInterest: selectedCountryOfInterest?.label, nationality: selectedNationality?.value, country: selectedCountry?.label, state: selectedState?.label, district: selectedDistrict?.value, city: selectedCity?.value, phone: phoneVal
    }
    await editLead(completeData, leadId);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!leadData) {
    return (
      <Alert variant="warning">
        <Alert.Heading>No User Data Found</Alert.Heading>
        <p>The user data is currently unavailable.</p>
      </Alert>
    );
  }

  return (
    <>
      <ToastContainer />
      <PageBreadcrumb title={`Edit Lead - ${leadData.firstname} ${leadData.lastname}`} subName="Leads" />
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title>Edit Lead</Card.Title>
            </Card.Header>
            <Card.Body>
              <FormProvider {...methods}>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <div className="table-responsive">
                    <Table>
                      <tbody>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="First Name"
                                  name="firstname"
                                  type="text"
                                  placeholder="Enter First Name"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Last Name"
                                  name="lastname"
                                  type="text"
                                  placeholder="Enter Last Name"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Email Address"
                                  name="email"
                                  type="email"
                                  placeholder="Enter Email"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                            <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>Gender</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={genderOptions}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedGender?.label === "null" ? { value: '', label: 'Select' } : selectedGender}
                                    onChange={handleSelect2}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                {/* <FormInput
                                  label="Phone"
                                  name="phone"
                                  type="tel"
                                  placeholder="Enter Phone"
                                  register={register}
                                  errors={errors}
                                /> */}
                                <FormInput
                                  label="Phone"
                                  name="phone"
                                  type="phone"
                                  placeholder="9876543210"
                                  value={phoneVal}
                                  register={register}
                                  errors={errors}
                                  refCallback={(value: string) => setPhoneVal(value)}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Date of Birth"
                                  name="dob"
                                  type="date"
                                  placeholder="Select Date of Birth"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>Nationality</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={nationalityOptions}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedNationality?.label === "null" ? { value: '', label: 'Select' } : selectedNationality}
                                    onChange={handleSelect3}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Marital Status"
                                  name="maritalStatus"
                                  type="text"
                                  placeholder="Enter Marital Status"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Passport Number"
                                  name="passportNumber"
                                  type="text"
                                  placeholder="Enter Passport Number"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Passport Expiry Date"
                                  name="passportExpiry"
                                  type="date"
                                  placeholder="Enter Passport Expiry Date"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Current Address"
                                  name="currentAddress"
                                  type="text"
                                  placeholder="Enter Current Address"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>Country</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={countries}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedCountry?.label === "null" ? { value: '', label: 'Select' } : selectedCountry}
                                    onChange={handleSelect5}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>State</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={states}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedState?.label === "null" ? { value: '', label: 'Select' } : selectedState}
                                    onChange={handleSelect6}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>District</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={districts}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedDistrict?.label === "null" ? { value: '', label: 'Select' } : selectedDistrict}
                                    onChange={handleSelect7}
                                    isClearable={true}
                                  />

                                </Form.Group>
                              </Col>
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={6} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>City</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={cities}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedCity?.label === "null" ? { value: '', label: 'Select' } : selectedCity}
                                    onChange={handleSelect8}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={6} md={6} sm={12}>
                                <FormInput
                                  label="Pincode"
                                  name="pincode"
                                  type="text"
                                  placeholder="Enter Pincode"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Highest Qualification"
                                  name="highestQualification"
                                  type="text"
                                  placeholder="Enter Highest Qualification"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Field of Study"
                                  name="fieldOfStudy"
                                  type="text"
                                  placeholder="Enter Field of Study"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Graduation Year"
                                  name="graduationYear"
                                  type="text"
                                  placeholder="Enter Graduation Year"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Grade/Percentage/CGPA"
                                  name="grade"
                                  type="text"
                                  placeholder="Enter Grade/Percentage/CGPA"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Test Score"
                                  name="testScore"
                                  type="text"
                                  placeholder="Enter Test Score"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Visa Category</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2 z-3"
                                    options={visaCategories as any[]}
                                    getOptionLabel={(e: any) => e.label}
                                    getOptionValue={(e: any) => e.value}
                                    value={selectedVisaCategory?.label === "null" ? { value: '', label: 'Select' } : selectedVisaCategory}
                                    onChange={handleSelect}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <Form.Group>
                                  <Form.Label>Country of Interest</Form.Label>
                                  <Select
                                    styles={customStyles(settings.theme === "dark")}
                                    className="select2"
                                    options={countryOptions}
                                    getOptionLabel={(e) => e.label ?? ''}
                                    getOptionValue={(e) => e.value ?? ''}
                                    value={selectedCountryOfInterest?.label === "null" ? { value: '', label: 'Select' } : selectedCountryOfInterest}
                                    onChange={handleSelect4}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Course of Interest"
                                  name="courseOfInterest"
                                  type="text"
                                  placeholder="Enter Course of Interest"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Preferred Mode of Communication"
                                  name="communicationMode"
                                  type="text"
                                  placeholder="Enter Preferred Mode of Communication"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Desired Field of Study"
                                  name="desiredFieldOfStudy"
                                  type="text"
                                  placeholder="Enter Desired Field of Study"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Preferred Institutions"
                                  name="preferredInstitutions"
                                  type="text"
                                  placeholder="Enter Preferred Institutions"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Reason for Immigration"
                                  name="reasonForImmigration"
                                  type="text"
                                  placeholder="Enter Reason for Immigration"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Financial Support"
                                  name="financialSupport"
                                  type="text"
                                  placeholder="Enter Financial Support"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Preferred Time for Contact"
                                  name="preferredContactTime"
                                  type="text"
                                  placeholder="Enter Preferred Time for Contact"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Source of Lead"
                                  name="leadSource"
                                  type="text"
                                  placeholder="Enter Source of Lead"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
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
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={6} md={6} sm={12}>
                                <FormInput
                                  label="Referral Name/Contact"
                                  name="referralContact"
                                  type="text"
                                  placeholder="Enter Referral Name/Contact"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={6} md={6} sm={12}>
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
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  <div className="text-center">
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </FormProvider>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EditLead;
