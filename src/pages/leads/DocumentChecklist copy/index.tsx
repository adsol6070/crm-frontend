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
import { FaCheckCircle, FaDownload, FaTrash, FaPlus, FaEdit, FaEye, FaClock } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import styles from './AddLeadChecklist.module.css';
import { leadApi, useAuthContext } from '@/common';
import Swal from 'sweetalert2';
import { visaDocuments, VisaType } from './visaDocuments';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 10000000; // 10MB in bytes 

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
  const [visaType, setVisaType] = useState<string>('');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [scale, setScale] = useState(1);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [currentDocName, setCurrentDocName] = useState<string | null>(null);

  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  const { onSubmit, getDocumentsUrl, fetchDocuments, uploadedDocs, setUploadedDocs, deleteDocument, updateDocument, deleteAllDocuments, getSingleDocumentUrl, loading } = useAddDocumentChecklist(leadId);

  const addMethods = useForm({
    resolver: yupResolver(addSchema),
    defaultValues: {
      documents: [],
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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'documents',
  });

  const fetchVisaType = async (leadId: string) => {
    const documents = await leadApi.getUploadedDocuments(leadId);
    const uploadedDocuments = documents.documents.map((document: any) => document.name);
    const myLeadData = await leadApi.getLeadById(leadId);

    if (myLeadData) {
      const visaCategory = myLeadData?.visaCategory?.trim()?.split(' ')[0];
      if (visaCategory) {
        setVisaType(visaCategory);
        const documentFields = visaDocuments[visaCategory as VisaType];
        if (!fields.length && uploadedDocuments.length !== 0) {

          const filteredDocumentFields = documentFields.filter(({ name }) => !uploadedDocuments.includes(name));

          if (filteredDocumentFields) {
            filteredDocumentFields.forEach((doc) => append({ name: doc.name, file: null }));
          }
        } else {
          documentFields.forEach((doc) => append({ name: doc.name, file: null }));
        }
      } else {
        console.log("Visa category is undefined.");
      }
    }
  };

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

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover these documents!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      const documentFields = visaDocuments[visaType as VisaType];
      const documents = await leadApi.getUploadedDocuments(leadId);
      const uploadedDocuments = documents.documents.map((document: any) => document.name);
      const documentField = documentFields.filter(doc => uploadedDocuments.includes(doc.name));
      if (documentField) {
        documentField.forEach((field) => {
          append({ name: field.name, file: null });
        })
      }
      await deleteAllDocuments();
    }
  };

  const handleDownload = async () => {
    const url = await getDocumentsUrl();
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lead_documents.zip');
    document.body.appendChild(link);
    link.click();
  };

  const handleViewDocument = async (filename: string) => {
    setLoadingPdf(true);
    const url = await getSingleDocumentUrl(filename);
    setSelectedPdf(url);
    setLoadingPdf(false);
  };

  const handleDownloadDocument = async (filename: string) => {
    const url = await getSingleDocumentUrl(filename);
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

  const handleDeleteSingleDocument = async (filename: string, docName: string) => {
    await deleteDocument(filename);

    const documentFields = visaDocuments[visaType as VisaType];
    const documentField = documentFields.find(doc => doc.name === docName);

    if (documentField) {
      append({ name: documentField.name, file: null });
    }
    const filteredUploadedDocs = uploadedDocs.filter((doc) => doc.name !== docName);
    setUploadedDocs(filteredUploadedDocs);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (pdfWrapperRef.current) {
      const wrapperWidth = pdfWrapperRef.current.offsetWidth;
      setScale(wrapperWidth / 600);
    }
  };

  useEffect(() => {
    fetchDocuments().then(() => fetchVisaType(leadId));

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
  }, [leadId]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    reset({ documents: [] });
  };

  const handleSingleDocumentSubmit = async (index: number) => {
    const document = addMethods.getValues(`documents.${index}`);
    if (!document.file) {
      await Swal.fire({
        icon: 'error',
        title: 'File Required',
        text: 'Please select a file to upload.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('tenantID', user.tenantID);
    formData.append('name', document.name);
    formData.append('uploadType', `leadDocuments-${leadId}`);
    formData.append('documents', document.file);

    await onSubmit({ documents: [document] });
    const updatedFields = fields.filter(field => field.name !== document.name);
    updatedFields.forEach((field, i) => update(i, field));
    reset({ documents: updatedFields });
  };

  const handleUpdateDocument = async (data: any) => {
    if (!currentFilename) return;

    const formData = new FormData();
    formData.append('tenantID', user.tenantID);
    formData.append('name', data.updateDocumentName);
    formData.append('uploadType', `leadDocuments-${leadId}`);
    formData.append('documents', data.updateDocumentFile);

    await updateDocument(formData, currentFilename);

    closeUpdateModal();
    updateReset();
  };

  return (
    <>
      <ToastContainer />
      <PageBreadcrumb title="Add Documents" subName="Leads" />
      <FormProvider {...addMethods}>
        <Container className="my-4">
          <Table responsive="md" className={`table-striped table-bordered text-center ${styles.tableStriped} ${styles.tableBordered}`}>
            <thead className={styles.theadStyles}>
              <tr>
                <th>S.No</th>
                <th>Document Name</th>
                <th>Upload</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className={styles.tableBodyDesign}>
              {uploadedDocs && uploadedDocs.length > 0 && uploadedDocs.map((doc, index) => (
                <tr key={`uploaded-${index}`}>
                  <td>{index + 1}</td>
                  <td>{doc.name}</td>
                  <td>
                    <p>Uploaded</p>
                  </td>
                  <td>
                    <Button variant="info" className="m-1" onClick={() => handleViewDocument(doc.filename!)}>
                      <FaEye />
                    </Button>
                    <Button variant="warning" className="m-1" onClick={() => openUpdateModal(doc.filename!, doc.name)}>
                      <FaEdit />
                    </Button>
                    <Button variant="info" className="m-1" onClick={() => handleDownloadDocument(doc.filename!)}>
                      <FaDownload />
                    </Button>
                    <Button variant="danger" className="m-1" onClick={() => handleDeleteSingleDocument(doc.filename!, doc.name)}>
                      <FaTrash />
                    </Button>
                  </td>
                  <td>
                    <FaCheckCircle color="green" size="1.5em" />
                  </td>
                </tr>
              ))}
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td>{uploadedDocs.length + index + 1}</td>
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
                    <Button variant="success" onClick={() => handleSingleDocumentSubmit(index)} className="m-1">
                      Upload
                    </Button>
                  </td>
                  <td>
                    <FaClock color="orange" size="1.5em" />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="text-center">
                  <Button variant="primary" className="mx-1" onClick={() => append({ name: '', file: null })}>
                    <FaPlus /> Add Document
                  </Button>
                  <Button variant="success" className="mx-1" onClick={handleSubmit(handleFormSubmit)} disabled={loading}>
                    Upload All
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
          {uploadedDocs?.length > 0 && (
            <div className="mt-5 d-flex justify-content-between">
              <Button className={`m-1 ${styles.btnDanger}`} variant="danger" onClick={handleDelete}>
                <FaTrash /> Delete All Documents
              </Button>
              <Button className={`m-1 ${styles.btnInfo}`} variant="info" onClick={handleDownload}>
                <FaDownload /> Download All Documents
              </Button>
            </div>
          )}
        </Container>
      </FormProvider>
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
