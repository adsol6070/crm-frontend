import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Form, Modal, Spinner, Container } from 'react-bootstrap';
import { PageBreadcrumb } from '@/components';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAddDocumentChecklist from './useDocumentChecklist';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheckCircle, FaDownload, FaTrash, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import styles from './AddLeadChecklist.module.css';
import { useAuthContext } from '@/common';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 1000000; // 1MB in bytes

const addSchema = yup.object().shape({
  documents: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Document name is required'),
      file: yup.mixed().required('File is required').test('fileSize', 'The file is too large', (value) => {
        return value && value.size <= MAX_FILE_SIZE;
      })
        .test('fileType', 'Unsupported File Format', (value) => {
          return value && ['application/pdf'].includes(value.type);
        }),
    })
  ),
});

const updateSchema = yup.object().shape({
  updateDocumentName: yup.string().required('Document name is required'),
  updateDocumentFile: yup.mixed().required('File is required').test('fileSize', 'The file is too large', (value) => {
    return value && value.size <= MAX_FILE_SIZE;
  })
    .test('fileType', 'Unsupported File Format', (value) => {
      return value && ['application/pdf'].includes(value.type);
    }),
});

const AddLeadChecklist: React.FC = () => {
  const { user } = useAuthContext();
  const { leadId } = useParams() as { leadId: string };
  const { onSubmit, getDocuments, fetchDocuments, uploadedDocs, deleteSingleDocument, updateSingleDocument, deleteDocuments, getSingleDocument, loading } = useAddDocumentChecklist(leadId);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [scale, setScale] = useState(1);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [currentDocName, setCurrentDocName] = useState<string | null>(null);

  const openUpdateModal = (filename: string, name: string) => {
    setCurrentFilename(filename);
    setCurrentDocName(name);
    updateMethods.setValue('updateDocumentName', name);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setCurrentFilename(null);
    setCurrentDocName(null);
    setShowUpdateModal(false);
  };

  const addMethods = useForm({
    resolver: yupResolver(addSchema),
    defaultValues: {
      documents: [{ name: '', file: null }],
    },
  });

  const updateMethods = useForm({
    resolver: yupResolver(updateSchema),
    defaultValues: {
      updateDocumentName: '',
      updateDocumentFile: {},
    },
  });

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = addMethods;
  const { register: updateRegister, handleSubmit: handleUpdateSubmit, setValue: setUpdateValue, formState: { errors: updateErrors }, reset: updateReset } = updateMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  });

  const handleDelete = async () => {
    await deleteDocuments(leadId);
    fetchDocuments();
  };

  const handleDownload = async () => {
    const url = await getDocuments();
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lead_documents.zip');
    document.body.appendChild(link);
    link.click();
  };

  const handleViewDocument = async (filename: string) => {
    setLoadingPdf(true);
    const url = await getSingleDocument(leadId, filename);
    setSelectedPdf(url);
    setLoadingPdf(false);
  };

  const handleDownloadDocument = async (filename: string) => {
    const url = await getSingleDocument(leadId, filename);
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };

  const handleDeleteSingleDocument = async (filename: string) => {
    await deleteSingleDocument(leadId, filename);
    fetchDocuments();
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (pdfWrapperRef.current) {
      const wrapperWidth = pdfWrapperRef.current.offsetWidth;
      setScale(wrapperWidth / 600);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (pdfWrapperRef.current) {
        const wrapperWidth = pdfWrapperRef.current.offsetWidth;
        setScale(wrapperWidth / 600);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    fetchDocuments();
    reset({ documents: [{ name: '', file: null }] });
  };

  const handleUpdateDocument = async (data: any) => {
    if (!currentFilename) return;
    
    const formData = new FormData();
    formData.append('tenantID', user.tenantID);
    formData.append('name', data.updateDocumentName);
    formData.append('uploadType', `leadDocuments-${leadId}`);
    formData.append('documents', data.updateDocumentFile);
    await updateSingleDocument(formData, currentFilename);

    closeUpdateModal();
    fetchDocuments();
    updateReset();
  };

  return (
    <>
      <ToastContainer />
      <PageBreadcrumb title="Add Documents" subName="Leads" />
      <FormProvider {...addMethods}>
        <Container className="my-4">
          <Form onSubmit={handleSubmit(handleFormSubmit)}>
            <Table responsive="md" className={`table-striped table-bordered text-center ${styles.tableStriped} ${styles.tableBordered}`}>
              <thead className={styles.theadStyles}>
                <tr>
                  <th>S.No</th>
                  <th>Document Name</th>
                  <th>Upload File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        type="text"
                        placeholder="Enter document name"
                        {...register(`documents.${index}.name` as const)}
                        isInvalid={!!errors.documents?.[index]?.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.documents?.[index]?.name?.message}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <Form.Control
                        type="file"
                        onChange={(e: any) =>
                          setValue(`documents.${index}.file`, e.target.files ? e.target.files[0] : null)
                        }
                        isInvalid={!!errors.documents?.[index]?.file}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.documents?.[index]?.file?.message}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => remove(index)}>
                        <FaTrash /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="text-center">
                    <Button variant="primary" onClick={() => append({ name: '', file: null })}>
                      <FaPlus /> Add Document
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
            <div className={`d-flex justify-content-end mt-3 ${styles.dFlexJustifyContentEndMt3}`}>
              <Button variant="success" type="submit" disabled={loading}>
                Submit
              </Button>
            </div>
          </Form>
        </Container>
      </FormProvider>
      <Container className="mt-5">
        <Table responsive="md" className={`table-striped table-bordered text-center ${styles.tableStriped} ${styles.table} ${styles.tableBordered}`}>
          <thead className={styles.theadStyles}>
            <tr>
              <th>S.No</th>
              <th>Document Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {uploadedDocs && uploadedDocs.length > 0 ? (
              uploadedDocs?.map((doc, index) => (
                <tr key={`uploaded-${index}`}>
                  <td>{index + 1}</td>
                  <td>{doc.name}</td>
                  <td>
                    <FaCheckCircle color="green" size="1.5em" />
                  </td>
                  <td>
                    <Button variant="info" className="m-1" onClick={() => handleViewDocument(doc.filename!)}>
                      <FaEye /> View
                    </Button>
                    <Button variant="warning" className="m-1" onClick={() => openUpdateModal(doc.filename!, doc.name)}>
                      <FaEdit /> Update
                    </Button>
                    <Button variant="info" className="m-1" onClick={() => handleDownloadDocument(doc.filename!)}>
                      <FaDownload /> Download
                    </Button>
                    <Button variant="danger" className="m-1" onClick={() => handleDeleteSingleDocument(doc.filename!)}>
                      <FaTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className='text-center'>
                <td colSpan={4}>No documents uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      {uploadedDocs?.length > 0 && (
        <Container className="mt-5 d-flex justify-content-between">
          <Button className={`m-1 ${styles.btnDanger}`} variant="danger" onClick={handleDelete}>
            <FaTrash /> Delete All Documents
          </Button>
          <Button className={`m-1 ${styles.btnInfo}`} variant="info" onClick={handleDownload}>
            <FaDownload /> Download All Documents
          </Button>
        </Container>
      )}
      {selectedPdf && (
        <Modal show={true} onHide={() => setSelectedPdf(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>View Here</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={pdfWrapperRef} className={styles.pdfWrapper}>
              {loadingPdf ? (
                <Spinner animation="border" />
              ) : (
                <Document
                  file={selectedPdf}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => console.error('Error loading PDF: ', error)}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} renderTextLayer={false} />
                  ))}
                </Document>
              )}
            </div>
          </Modal.Body>
        </Modal>
      )}
      <Modal show={showUpdateModal} onHide={closeUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormProvider {...updateMethods}>
            <Form onSubmit={handleUpdateSubmit(handleUpdateDocument)}>
              <Form.Group controlId="formDocumentName">
                <Form.Label>Document Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter document name"
                  {...updateRegister('updateDocumentName')}
                  isInvalid={!!updateErrors.updateDocumentName}
                />
                {updateErrors.updateDocumentName && (
                  <Form.Control.Feedback type="invalid">
                    {updateErrors.updateDocumentName.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group controlId="formDocumentFile" className="mt-3">
                <Form.Label>Upload File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e: any) => setUpdateValue('updateDocumentFile', e.target.files ? e.target.files[0] : null)}
                  isInvalid={!!updateErrors.updateDocumentFile}
                />
                {updateErrors.updateDocumentFile && (
                  <Form.Control.Feedback type="invalid">
                    {updateErrors.updateDocumentFile.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3">
                Update Document
              </Button>
            </Form>
          </FormProvider>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddLeadChecklist;
