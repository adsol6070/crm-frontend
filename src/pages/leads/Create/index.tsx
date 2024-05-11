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

// Validation schema
const schema = yup.object({
    firstname: yup.string().required('Please enter your First Name'),
    lastname: yup.string().required('Please enter your Last Name'),
    email: yup.string().required('Please enter your Email').email('Please enter a valid Email'),
    phone: yup.string().required('Please enter your Phone Number'),
    qualification: yup.string().required('Please enter your Qualification'),
    VisaInterest: yup.string().required('Please specify your Visa Interest'),
}).required();

const AddLead = () => {
    const { createLead } = useCreateLead()
    const [step, setStep] = useState(1);
    const [collectedData, setCollectedData] = useState({});
    const { register, handleSubmit, getValues, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onTouched'
    });

    const handleNext = () => {
        const currentData = getValues();
        const newData = {
            ...collectedData,
            ...currentData
        };
        setCollectedData(newData);
        console.log("Data at current step:", newData);

        if (step < 3) {
            setStep(step + 1);
        }
    };

    const onSubmit = (data: any) => {
        const finalData = {
            ...collectedData,
            ...data
        };
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
                            <Stepper activeStep={step - 1} connectorStateColors styleConfig={{
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
                                connectorColor: '#cccccc'
                            }}>
                                <Step label="Personal Details" />
                                <Step label="Academic Details" />
                                <Step label="Confirmation" />
                            </Stepper>

                            <div className="form-step-container">
                                {step === 1 && (
                                    <Form className="step-form" onSubmit={handleSubmit(handleNext)}>
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
                                        <Button variant="primary" onClick={handleNext}>Next</Button>
                                    </Form>
                                )}

                                {step === 2 && (
                                    <Form className="step-form" onSubmit={handleSubmit(handleNext)}>
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
                                        <Button variant="primary" onClick={handleNext}>Next</Button>
                                    </Form>
                                )}

                                {step === 3 && (
                                    <Form className="confirmation-step" onSubmit={handleSubmit(onSubmit)}>
                                        <h5>Confirmation</h5>
                                        <p>All steps completed - review your information before submitting.</p>
                                        <pre>
                                            {JSON.stringify(collectedData, null, 2)}
                                        </pre>
                                        <Button variant="success" type="submit">Submit</Button>
                                    </Form>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AddLead;
