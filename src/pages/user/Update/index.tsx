import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Card, Col, Form, Row, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { FormInput, PageBreadcrumb } from '@/components';
import useEditUser from './useEditUser';
import { useForm } from 'react-hook-form';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: string;
  tenantID: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  profileImage: string;
  role: 'superAdmin' | 'admin' | 'user';
  isEmailVerified: boolean;
}

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
//   const location = useLocation();
  const [newImage, setNewImage] = useState<File | null>(null);

  const { userData, loading, error, editUser } = useEditUser(userId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<User>();

  useEffect(() => {
    if (userData) {
      Object.keys(userData).forEach((key) => {
        setValue(key as keyof User, userData[key as keyof User]);
      });
    }
  }, [userData, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  };

  const onSubmit = async (data: User) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'password' && data[key] === '') {
        return;
      }
      if (key !== 'profileImage') {
        formData.append(key, data[key as keyof User]);
      }
    });

    if (newImage) {
      formData.append('profileImage', newImage);
    }

    await editUser(formData);
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

  if (!userData) {
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
      <PageBreadcrumb title={`Edit User - ${userData.firstname} ${userData.lastname}`} subName="Users" />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="header-title">Edit User Profile</h4>
              <p className="text-muted mb-0">
                Update the details of the user. You can change information such as names, email, role, and contact details. Ensure all information is up-to-date.
              </p>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormInput
                      label="First Name"
                      name="firstname"
                      register={register}
                      errors={errors}
                      required
                      containerClass="mb-3"
                    />
                    <FormInput
                      label="Last Name"
                      name="lastname"
                      register={register}
                      errors={errors}
                      containerClass="mb-3"
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      name="email"
                      register={register}
                      errors={errors}
                      required
                      containerClass="mb-3"
                    />
                    <FormInput
                      label="Phone"
                      name="phone"
                      register={register}
                      errors={errors}
                      containerClass="mb-3"
                    />
                    <FormInput
                      label="Password"
                      type="password"
                      name="password"
                      placeholder="Enter new password"
                      containerClass="mb-3"
                      register={register}
                    />
                    <FormInput
                      label="Set New Profile Image"
                      type="file"
                      name="profileImage"
                      containerClass="mb-3"
                      onChange={handleImageChange}
                    />
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Select
                        options={[
                          { value: 'superAdmin', label: 'Super Admin' },
                          { value: 'admin', label: 'Admin' },
                          { value: 'user', label: 'User' },
                        ]}
                        defaultValue={{ label: userData.role, value: userData.role }}
                        onChange={(option) => setValue('role', option!.value)}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EditUser;
