import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Stepper, Step, StepLabel, Button, TextField, Typography, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const schema = yup.object({
    firstname: yup.string().required('Please enter Firstname'),
    lastname: yup.string().required('Please enter Lastname'),
    email: yup.string().required('Please enter Email').email('Please enter valid Email'),
    phone: yup.string().required('Please enter Phone'),
    qualification: yup.string().required('Please enter qualification'),
    visaInterest: yup.string().required('Please enter visa interest'),
}).required();

const steps = ['Personal Details', 'Academic Details', 'Confirmation'];

const AddLead = () => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            qualification: '',
            visaInterest: ''
        }
    });
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
    const onSubmit = (data) => {
        if (activeStep === steps.length - 1) {
            toast.success("Lead created successfully!");
            console.log(data);
            reset();
        } else {
            handleNext();
        }
    };

    return (
        <Container maxWidth="sm">
            <ToastContainer />
            <Typography variant="h4" align="center" marginY={4}>Add New Lead</Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {activeStep === 0 && (
                    <Box marginY={2}>
                        <Controller
                            name="firstname"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="First Name" margin="normal" {...field} error={!!errors.firstname} helperText={errors.firstname?.message} />}
                        />
                        <Controller
                            name="lastname"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="Last Name" margin="normal" {...field} error={!!errors.lastname} helperText={errors.lastname?.message} />}
                        />
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="Email" margin="normal" {...field} error={!!errors.email} helperText={errors.email?.message} />}
                        />
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="Phone" margin="normal" {...field} error={!!errors.phone} helperText={errors.phone?.message} />}
                        />
                    </Box>
                )}
                {activeStep === 1 && (
                    <Box marginY={2}>
                        <Controller
                            name="qualification"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="Qualification" margin="normal" {...field} error={!!errors.qualification} helperText={errors.qualification?.message} />}
                        />
                        <Controller
                            name="visaInterest"
                            control={control}
                            render={({ field }) => <TextField fullWidth label="Visa Interest" margin="normal" {...field} error={!!errors.visaInterest} helperText={errors.visaInterest?.message} />}
                        />
                    </Box>
                )}
                {activeStep === 2 && (
                    <Typography variant="h5" align="center" marginY={2}>
                        Confirmation
                    </Typography>
                )}
                <Box display="flex" justifyContent="flex-end" marginY={2}>
                    {activeStep > 0 && (
                        <Button onClick={handleBack} sx={{ mr: 1 }}>
                            Back
                        </Button>
                    )}
                    <Button variant="contained" type="submit">
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default AddLead;