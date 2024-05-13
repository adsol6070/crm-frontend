import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageBreadcrumb } from '@/components';
import { Stepper, Step } from 'react-form-stepper';
import './AddLead.css';
import useCreateLead from './useCreateLeadForm';

interface CollectedData {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    qualification?: string;
    VisaInterest?: string;
}
interface FinalLeadData {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    qualification: string;
    VisaInterest: string;
}
const stepSchemas = [
    yup.object({
        firstname: yup.string().required('Please enter your First Name'),
        lastname: yup.string().required('Please enter your Last Name'),
        email: yup.string().required('Please enter your Email').email('Please enter a valid Email'),
        phone: yup.string().required('Please enter your Phone Number'),
    }).required(),
    yup.object({
        qualification: yup.string().required('Please enter your Qualification'),
        VisaInterest: yup.string().required('Please specify your Visa Interest'),
    }).required(),
];

const AddLead = () => {
    const { createLead } = useCreateLead();
    const [step, setStep] = useState(1);
    const [collectedData, setCollectedData] = useState({});

    const currentSchema = stepSchemas[step - 1] || yup.object().shape({});

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(currentSchema),
        mode: 'onTouched',
    });

    const handleNext = (data: CollectedData) => {
        const newData = { ...collectedData, ...data };
        setCollectedData(newData);

        if (step < stepSchemas.length + 1) {
            setStep(step + 1);
        } else {
            onSubmit(newData);
        }
    };

    const onSubmit = (data: CollectedData) => {
        const finalData: FinalLeadData = { ...collectedData, ...data };
        console.log("Final data:", finalData);
        createLead(finalData);
        reset();
        setCollectedData({});
        setStep(1);
    };

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
                            <Stepper activeStep={step - 1} styleConfig={{
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
                                fontWeight: 'bold'
                            }}>
                                <Step label="Personal Details" />
                                <Step label="Academic Details" />
                                <Step label="Confirmation" />
                            </Stepper>

                            <Form className="form-step-container" onSubmit={handleSubmit(handleNext)}>
                                {step === 1 && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter First Name" {...register("firstname")} isInvalid={!!errors.firstname} />
                                            <Form.Control.Feedback type="invalid">{errors.firstname?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Last Name" {...register("lastname")} isInvalid={!!errors.lastname} />
                                            <Form.Control.Feedback type="invalid">{errors.lastname?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control type="email" placeholder="Enter Email" {...register("email")} isInvalid={!!errors.email} />
                                            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control type="tel" placeholder="Enter Phone" {...register("phone")} isInvalid={!!errors.phone} />
                                            <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Button variant="primary" type="submit">Next</Button>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Qualification</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Qualification" {...register("qualification")} isInvalid={!!errors.qualification} />
                                            <Form.Control.Feedback type="invalid">{errors.qualification?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Visa Interest</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Visa Interest" {...register("VisaInterest")} isInvalid={!!errors.VisaInterest} />
                                            <Form.Control.Feedback type="invalid">{errors.VisaInterest?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Button variant="primary" type="submit">Next</Button>
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <h5>Confirmation</h5>
                                        <p>All steps completed - please review your information before submitting.</p>
                                        <div className="review-data">
                                            <p><b>First Name:</b> {collectedData.firstname}</p>
                                            <p><b>Last Name:</b> {collectedData.lastname}</p>
                                            <p><b>Email:</b> {collectedData.email}</p>
                                            <p><b>Phone:</b> {collectedData.phone}</p>
                                            <p><b>Qualification:</b> {collectedData.qualification}</p>
                                            <p><b>Visa Interest:</b> {collectedData.VisaInterest}</p>
                                        </div>
                                        <Button variant="success" type="button" onClick={() => onSubmit(collectedData)}>Submit</Button>
                                    </>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AddLead;
