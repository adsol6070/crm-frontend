import React from 'react';
import { Button, Col, Form, Modal } from 'react-bootstrap';
import styles from './kanban.module.css';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '@/components/FormInput';
import useTask from './useTask';

interface FormValues {
    taskStatus: string;
    taskTitle: string;
    taskDescription: string;
}

interface AddTaskModalProps {
    show: boolean;
    onHide: () => void;
}

interface OptionType {
    value: string;
    label: string;
}

const taskStatusOptions: OptionType[] = [
    { value: 'to_do', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'need_review', label: 'Need Review' },
    { value: 'done', label: 'Done' },
];


const schema = yup.object().shape({
    taskStatus: yup.string().required('Please enter your task status'),
    taskTitle: yup.string().required('Please enter your task title'),
    taskDescription: yup.string().required('Please enter your task description'),
});

const AddTaskModal: React.FC<AddTaskModalProps> = ({ show, onHide }) => {
    const { createTask } = useTask();
    
    const methods = useForm<FormValues>({
        resolver: yupResolver(schema),
        mode: 'onTouched',
    });

    const { handleSubmit, formState: { errors }, reset } = methods;

    const addTask = async (data: any) => {
        createTask(data)
        reset();
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Task</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                <FormProvider {...methods}>
                    <Form onSubmit={handleSubmit(addTask)}>
                        <Col className='mb-2'>
                            <FormInput
                                label="Task Title"
                                name="taskTitle"
                                type="text"
                                placeholder="Enter your task title"
                                register={methods.register}
                                errors={errors}
                            />
                        </Col>
                        <Col className='mb-2'>
                            <FormInput
                                label="Task Description"
                                name="taskDescription"
                                type=""
                                placeholder="Enter your task description"
                                register={methods.register}
                                errors={errors}
                            />
                        </Col>
                        <Col className='mb-2'>
                            <FormInput
                                name="taskStatus"
                                label="Task Status"
                                type="select"
                                containerClass="mb-3"
                                className="form-select"
                                register={methods.register}
                                errors={errors}
                                control={methods.control}
                            >
                                <option value="">Select...</option>
                                {taskStatusOptions.map((option: any) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </FormInput>
                        </Col>
                        <Col className='d-flex align-items-center justify-content-center'>
                            <Button
                                variant="secondary"
                                type="submit"
                                >
                                Add Task
                            </Button>
                        </Col>
                    </Form>
                </FormProvider>
            </Modal.Body>
        </Modal>
    );
};

export default AddTaskModal;
