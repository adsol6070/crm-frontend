import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Row, Col, Card, Form, Button, ToastContainer, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { PageBreadcrumb } from '@/components';
import styles from './CRScalculator.module.css';
import { scoreApi, useAuthContext } from '@/common';
import FormInput from '@/components/FormInput';

interface OptionType {
    value: string;
    label: string;
}

interface FormValues {
    name: string;
    phone: string;
    email: string;
    age: number;
    education: string;
    foreign_experience: string;
    canadian_experience: string;
    first_language: string;
    second_language: string;
    spouse: string;
    sibling_in_canada: string;
    job_offer: string;
    provincial_nomination: string;
}

const languageOptions: OptionType[] = [
    { value: 'none', label: 'None' },
    { value: 'CLB 9', label: 'CLB 9' },
    { value: 'CLB 8', label: 'CLB 8' },
    { value: 'CLB 7', label: 'CLB 7' },
];

const educationOptions: OptionType[] = [
    { value: 'none', label: 'None' },
    { value: 'phd', label: 'PhD' },
    { value: 'masters', label: 'Master’s Degree' },
    { value: 'bachelors', label: 'Bachelor’s Degree' },
];

const workExperienceOptions: OptionType[] = [
    { value: 'none', label: 'None' },
    { value: '5_or_more', label: '5 years or more' },
    { value: '3_to_4', label: '3 to 4 years' },
    { value: '1_to_2', label: '1 to 2 years' },
];

const spouseOptions: OptionType[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

const siblingOptions: OptionType[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

const jobOfferOptions: OptionType[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

const nominationOptions: OptionType[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

const schema = yup.object().shape({
    name: yup.string().required('Please enter your name').trim(),
    phone: yup.string().required('Please enter your phone number').matches(/^\d{10}$/, 'Phone number is not valid').trim(),
    email: yup.string().required('Please enter your email').email('Email is not valid').trim(),
    age: yup.number().required('Please enter your age').min(18, 'Minimum age is 18').max(47, 'Maximum age is 47'),
    education: yup.string().required('Please select your education level'),
    foreign_experience: yup.string().required('Please select your foreign work experience'),
    canadian_experience: yup.string().required('Please select your Canadian work experience'),
    first_language: yup.string().required('Please select your first language proficiency'),
    second_language: yup.string().nullable(),
    spouse: yup.string().required('Please indicate if you have a spouse or common-law partner'),
    sibling_in_canada: yup.string().required('Please indicate if you have a sibling in Canada'),
    job_offer: yup.string().required('Please indicate if you have a job offer'),
    provincial_nomination: yup.string().required('Please indicate if you have a provincial nomination'),
});

const CRScalculator: React.FC = () => {
    const methods = useForm<FormValues>({
        resolver: yupResolver(schema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            age: undefined,
            education: '',
            foreign_experience: '',
            canadian_experience: '',
            first_language: '',
            second_language: '',
            spouse: '',
            sibling_in_canada: '',
            job_offer: '',
            provincial_nomination: '',
        },
    });

    const { handleSubmit, formState: { errors }, setValue, reset, watch } = methods;
    const watchedValues = watch();

    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState<FormValues | null>(null);
    const [userScore, setUserScore] = useState(0);
    const maxScore = 1200;
    const { user } = useAuthContext();

    useEffect(() => {
        const savedValues = sessionStorage.getItem('crsCalculatorValues');
        if (savedValues) {
            const parsedValues = JSON.parse(savedValues);
            Object.keys(parsedValues).forEach(key => {
                setValue(key as keyof FormValues, parsedValues[key]);
            });
        }
    }, [setValue]);

    useEffect(() => {
        sessionStorage.setItem('crsCalculatorValues', JSON.stringify(watchedValues));
    }, [watchedValues]);

    const calculateCRS: SubmitHandler<FormValues> = (data) => {
        let score = 0;

        // Calculate age points
        const age = parseInt(data.age.toString());
        if (age >= 18 && age <= 29) score += 110;
        else if (age === 30) score += 105;
        else if (age === 31) score += 99;
        else if (age === 32) score += 94;
        else if (age === 33) score += 88;
        else if (age === 34) score += 83;
        else if (age === 35) score += 77;
        else if (age === 36) score += 72;
        else if (age === 37) score += 66;
        else if (age === 38) score += 61;
        else if (age === 39) score += 55;
        else if (age === 40) score += 50;
        else if (age === 41) score += 39;
        else if (age === 42) score += 28;
        else if (age === 43) score += 17;
        else if (age === 44) score += 6;
        else if (age >= 45) score += 0;

        // Calculate education points
        const education = data.education;
        if (education === 'phd') score += 150;
        else if (education === 'masters') score += 135;
        else if (education === 'bachelors') score += 120;

        // Calculate work experience points
        const foreignExperience = data.foreign_experience;
        const canadianExperience = data.canadian_experience;
        if (foreignExperience === '5_or_more') score += 50;
        else if (foreignExperience === '3_to_4') score += 40;
        else if (foreignExperience === '1_to_2') score += 25;
        
        if (canadianExperience === '5_or_more') score += 80;
        else if (canadianExperience === '3_to_4') score += 72;
        else if (canadianExperience === '1_to_2') score += 64;

        // Calculate language proficiency points
        const firstLanguage = data.first_language;
        if (firstLanguage === 'CLB 9') score += 136;
        else if (firstLanguage === 'CLB 8') score += 124;
        else if (firstLanguage === 'CLB 7') score += 112;

        // Calculate additional points
        if (data.sibling_in_canada === 'yes') score += 15;
        if (data.job_offer === 'yes') score += 50;
        if (data.provincial_nomination === 'yes') score += 600;

        setUserData(data);
        setUserScore(score);
        setShowModal(true);
    };

    const handleSaveScores = async () => {
        if (userData) {
            console.log("user data ", userData)
            const dataToSave = {
                tenantID: user.tenantID,
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                score: userScore,
            };

            try {
                await scoreApi.createScore(dataToSave);
                Swal.fire('Scores saved successfully!', '', 'success');
            } catch (error) {
                console.error('Error saving scores:', error);
                Swal.fire('An unexpected error occurred', '', 'error');
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        reset();
        sessionStorage.removeItem('crsCalculatorValues');
    };

    return (
        <>
            <ToastContainer />
            <PageBreadcrumb title="Calculate CRS" subName="Calculate" />
            <Row>
                <Col md={12}>
                    <Card className={styles.card}>
                        <Card.Header className={styles.cardHeader}>
                            <Card.Title className={styles.cardTitle}>Calculate Your CRS Score</Card.Title>
                        </Card.Header>
                        <Card.Body className={styles.cardBody}>
                            <FormProvider {...methods}>
                                <Form onSubmit={handleSubmit(calculateCRS)}>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                label="Name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter your name"
                                                register={methods.register}
                                                errors={errors}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                label="Phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                register={methods.register}
                                                errors={errors}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                register={methods.register}
                                                errors={errors}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                label="Age"
                                                name="age"
                                                type="number"
                                                placeholder="Enter your age"
                                                register={methods.register}
                                                errors={errors}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                name="education"
                                                label="Education Level"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="education"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {educationOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                name="foreign_experience"
                                                label="Foreign Work Experience"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="foreign_experience"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {workExperienceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                name="canadian_experience"
                                                label="Canadian Work Experience"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="canadian_experience"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {workExperienceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                name="first_language"
                                                label="First Language Proficiency"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="first_language"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {languageOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                name="spouse"
                                                label="Do you have a spouse or common-law partner?"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="spouse"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {spouseOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                name="sibling_in_canada"
                                                label="Do you have a sibling in Canada?"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="sibling_in_canada"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {siblingOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                name="job_offer"
                                                label="Do you have a valid job offer?"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="job_offer"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {jobOfferOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                name="provincial_nomination"
                                                label="Do you have a provincial nomination?"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="provincial_nomination"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {nominationOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                name="second_language"
                                                label="Second Language Proficiency (if any)"
                                                type="select"
                                                containerClass="mb-3"
                                                className="form-select"
                                                register={methods.register}
                                                key="second_language"
                                                errors={errors}
                                                control={methods.control}
                                            >
                                                <option value="">Select...</option>
                                                {languageOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </FormInput>
                                        </Col>
                                    </Row>
                                    <Button className={styles.button} type="submit">Calculate CRS Score</Button>
                                </Form>
                            </FormProvider>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton className={styles.modalHeader}>
                    <Modal.Title className={styles.modalTitle}>CRS Score Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    {userData && (
                        <div>
                            <p><strong>Name:</strong> {userData.name}</p>
                            <p><strong>Phone:</strong> {userData.phone}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Age:</strong> {userData.age}</p>
                            <p><strong>Education:</strong> {userData.education}</p>
                            <p><strong>Foreign Experience:</strong> {userData.foreign_experience}</p>
                            <p><strong>Canadian Experience:</strong> {userData.canadian_experience}</p>
                            <p><strong>First Language:</strong> {userData.first_language}</p>
                            <p><strong>Second Language:</strong> {userData.second_language ? userData.second_language : 'N/A'}</p>
                            <p><strong>Spouse/Common-law partner:</strong> {userData.spouse}</p>
                            <p><strong>Sibling in Canada:</strong> {userData.sibling_in_canada}</p>
                            <p><strong>Job Offer:</strong> {userData.job_offer}</p>
                            <p><strong>Provincial Nomination:</strong> {userData.provincial_nomination}</p>
                            <p className={styles.scoreAlert}><strong>CRS Score: {userScore} / {maxScore}</strong></p>
                            <div className={styles.passFailMessage}>
                                {userScore >= 450 ? (
                                    <p className={styles.successMessage}>You Passed</p>
                                ) : (
                                    <p className={styles.failMessage}>You Did Not Pass</p>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <Button variant="primary" onClick={handleSaveScores}>
                        Save Scores
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CRScalculator;
