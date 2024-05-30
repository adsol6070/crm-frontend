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

interface VisaCategory {
  value: string
  label: string
}

interface LeadData {
  permanentAddress: string;
  currentAddress: string;
  passportExpiry: string;
  passportNumber: string;
  maritalStatus: string;
  nationality: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  lastname: string;
  firstname: string;
  highestQualification: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
  grade: string;
  testType: string;
  testScore: string;
  countryOfInterest: string;
  courseOfInterest: string;
  desiredFieldOfStudy: string;
  preferredInstitutions: string;
  intakeSession: string;
  reasonForImmigration: string;
  financialSupport: string;
  sponsorDetails: string;
  proofOfFunds: Record<string, any>;
  scholarships: string;
  visaCategory: string;
  languageTestReport: Record<string, any>;
  passportCopy: Record<string, any>; 
  certificates: Record<string, any>;
  transcripts: Record<string, any>; 
  sop: Record<string, any>;
  recommendationLetter: Record<string, any>;
  resume: Record<string, any>; 
  leadNotes: string;
  leadRating: string;
  followUpDates: string;
  assignedAgent: string;
  leadStatus: string;
  referralContact: string;
  leadSource: string;
  notes: string;
  preferredContactTime: string;
  communicationMode: string;
  created_at: string;
}
const EditLead: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const { leadData, loading, error } = useReadLead(leadId as string);
  const { editLead, visaCategories } = useEditLead();
  const [selectedVisaCategory, setSelectedVisaCategory] = useState<VisaCategory | null>(null)
console.log(leadData)
  const methods = useForm({
    defaultValues: leadData ?? {},
  });

  const { register, handleSubmit, setValue, formState: { errors } } = methods;

  useEffect(() => {
    if (leadData) {
      Object.keys(leadData).forEach((key) => {
        if (key.includes('Date') && leadData[key as keyof LeadData]) {
          setValue(key as keyof LeadData, new Date(leadData[key]).toLocaleDateString('en-CA'));
        } else if (key === 'dob') {
          setValue(key, leadData[key] ? new Date(leadData[key]).toLocaleDateString('en-CA') : '');
        } else if (key === 'passportExpiry') {
          setValue(key, leadData[key] ? new Date(leadData[key]).toLocaleDateString('en-CA') : '');
        }  else {
          setValue(key as keyof LeadData, leadData[key as keyof LeadData]);
        }
      });

      if (leadData.visaCategory) {
        setSelectedVisaCategory({
          label: leadData.visaCategory,
          value: leadData.visaCategory,
        })
      }
    }

  }, [leadData, setValue]);

  const handleSelect = (option: VisaCategory | null) => {
		setSelectedVisaCategory(option)
	}

  const onSubmit = async (data: any) => {
    const completeData = {
      ...data, visaCategory: selectedVisaCategory?.value
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
                                <FormInput
                                  label="Phone"
                                  name="phone"
                                  type="tel"
                                  placeholder="Enter Phone"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Gender"
                                  name="gender"
                                  type="text"
                                  placeholder="Enter Gender"
                                  register={register}
                                  errors={errors}
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
                                <FormInput
                                  label="Nationality"
                                  name="nationality"
                                  type="text"
                                  placeholder="Enter Nationality"
                                  register={register}
                                  errors={errors}
                                />
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
                                    className="select2 z-3"
                                    defaultValue={selectedVisaCategory}
                                    options={visaCategories as any[]}
                                    getOptionLabel={(e: any) => e.label}
                                    getOptionValue={(e: any) => e.value}
                                    value={selectedVisaCategory}
                                    onChange={handleSelect}
                                    isClearable={true}
                                  />
                                </Form.Group>
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Country of Interest"
                                  name="countryOfInterest"
                                  type="text"
                                  placeholder="Enter Country of Interest"
                                  register={register}
                                  errors={errors}
                                />
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
                                  label="Notes/Comments"
                                  name="notes"
                                  type="text"
                                  placeholder="Enter Notes/Comments"
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
                            </Row>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Row>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Referral Name/Contact"
                                  name="referralContact"
                                  type="text"
                                  placeholder="Enter Referral Name/Contact"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Lead Status"
                                  name="leadStatus"
                                  type="text"
                                  placeholder="Enter Lead Status"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Assigned Agent/Counselor"
                                  name="assignedAgent"
                                  type="text"
                                  placeholder="Enter Assigned Agent/Counselor"
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
                                  label="Follow-up Dates"
                                  name="followUpDates"
                                  type="date"
                                  placeholder="Enter Follow-up Dates"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Lead Rating"
                                  name="leadRating"
                                  type="text"
                                  placeholder="Enter Lead Rating"
                                  register={register}
                                  errors={errors}
                                />
                              </Col>
                              <Col lg={4} md={6} sm={12}>
                                <FormInput
                                  label="Lead Notes"
                                  name="leadNotes"
                                  type="text"
                                  placeholder="Enter Lead Notes"
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
