import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageBreadcrumb } from '@/components';
import { useVisaChecklist } from './useVisaChecklists';
import styles from './AddVisaChecklists.module.css';
import FormInput from '@/components/FormInput';
import { useVisaCategory } from '../AddVisaCategory/useVisaCategory';
import VisaChecklistDisplay from './visaChecklistDisplay';
import { capitalizeFirstLetter, hasPermission } from '@/utils';
import { usePermissions } from '@/common';

const schema = yup.object().shape({
  visaType: yup.string().required('Visa type is required'),
  checklists: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Document name is required'),
    })
  ).required('Checklists are required'),
});

const AddVisaChecklists: React.FC = () => {
  const { permissions } = usePermissions();
  const { createChecklists, visaChecklists } = useVisaChecklist();
  const { visaCategories } = useVisaCategory();

  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (visaChecklists.length > 0) {
      setActiveKey(visaChecklists[0].visaType);
    }
  }, [visaChecklists]);

  const { control, handleSubmit, reset, formState: { errors }, register } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      visaType: '',
      checklists: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklists',
  });

  const onSubmit = async (data: any) => {
    const checklistWithRequired = data.checklists.map((item: any) => ({
      ...item,
      required: true,
    }));
    const payload = { ...data, checklists: checklistWithRequired };
    await createChecklists(payload);
    reset();
  };

  return (
    <>
      <ToastContainer />
      <PageBreadcrumb title="Add Checklists" subName="Checklists" />
      {hasPermission(permissions, 'Checklists', 'Create') && (
      <Card className={styles.card}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              name="visaType"
              label="Visa Type"
              type="select"
              containerClass="mb-3"
              className="form-select"
              register={register}
              control={control}
              errors={errors}
            >
              <option value="">Select visa type</option>
              {visaCategories.map((category: { id: string, category: string }) => (
                <option key={category.id} value={category.category}>{category.category}</option>
              ))}
            </FormInput>
            
            {fields.map((item, index) => (
              <div key={item.id}>
                <Row style={{ display: "flex", alignItems: "center" }}>
                  <Col>
                    <FormInput
                      name={`checklists.${index}.name`}
                      label="Document Name"
                      type="text"
                      placeholder="Enter document name"
                      containerClass="mb-3"
                      className="form-control"
                      register={register}
                      control={control}
                      errors={errors}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button variant="danger" className="my-1 btn-sm" onClick={() => remove(index)}>Remove</Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button variant="primary" className="my-1 btn-sm" onClick={() => append({ name: '' })}>Add Document</Button>
            <Button variant="success" type="submit" className="ms-2 btn-sm">Submit</Button>
          </Form>
        </Card.Body>
      </Card>
      )}
      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || '')}
        className={`${styles.tabs}`}
        fill
      >
        {visaChecklists.map((checklist: any) => (
          <Tab eventKey={checklist.visaType} title={capitalizeFirstLetter(checklist.visaType)} key={checklist.id}>
            <VisaChecklistDisplay 
              id={checklist.id} 
              visaType={checklist.visaType} 
              checklists={checklist.checklist}
            />
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default AddVisaChecklists;
