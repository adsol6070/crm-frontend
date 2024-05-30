import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Form, Modal, Spinner, Container } from 'react-bootstrap';
import { PageBreadcrumb } from '@/components';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAddDocumentChecklist from './useDocumentChecklist';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheckCircle, FaDownload, FaTrash, FaPlus, FaFileUpload } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './AddLeadChecklist.css'; // Import custom CSS for additional styling

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Validation schema for the form
const schema = yup.object().shape({
  documents: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Document name is required'),
      file: yup.mixed().nullable(),
    })
  ),
});

interface Document {
  name: string;
  originalname?: string;
  filename?: string;
  path?: string;
  mimetype?: string;
  size?: number;
}

const AddLeadChecklist: React.FC = () => {
  const { leadId } = useParams() as { leadId: string };
  const { onSubmit, getDocuments, fetchUploadedDocuments, deleteSingleDocument, deleteDocuments, getSingleDocument, loading } = useAddDocumentChecklist(leadId);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [scale, setScale] = useState(1);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      documents: [{ name: '', file: null }],
    },
  });

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      const documents = await fetchUploadedDocuments(leadId);
      setUploadedDocs(documents.documents);
    };

    fetchDocuments();
  }, [fetchUploadedDocuments, leadId]);

  const handleDelete = async () => {
    await deleteDocuments(leadId);
    setUploadedDocs([]);
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
    setUploadedDocs(prev => prev.filter(doc => doc.filename !== filename));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (pdfWrapperRef.current) {
      const wrapperWidth = pdfWrapperRef.current.offsetWidth;
      setScale(wrapperWidth / 600); // assuming the width of the PDF is 600px
    }
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    const fetchedDocuments = await fetchUploadedDocuments(leadId);
    const newDocuments = fetchedDocuments.documents.filter(
      (newDoc: Document) => !uploadedDocs.some((doc: Document) => doc.filename === newDoc.filename)
    );
    setUploadedDocs((prev) => [...prev, ...newDocuments]);
    reset({ documents: [] });
  };

  return (
    <>
      <ToastContainer />
      <PageBreadcrumb title="Add Documents" subName="Leads" />
      <FormProvider {...methods}>
        <Container className="my-4">
          <Form onSubmit={handleSubmit(handleFormSubmit)}>
            <Table responsive="md" className="table-striped table-bordered text-center">
              <thead style={{backgroundColor: "#1a2942b8"}}>
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
                      />
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
            <div className="d-flex justify-content-end mt-3">
              <Button variant="success" type="submit" disabled={loading}>
                Submit
              </Button>
            </div>
          </Form>
        </Container>
      </FormProvider>
      <Container className="mt-5">
        <Table responsive="md" className="table-striped table-bordered text-center">
          <thead style={{backgroundColor: "#1a2942b8"}}>
            <tr>
              <th>S.No</th>
              <th>Document Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {uploadedDocs?.map((doc, index) => (
              <tr key={`uploaded-${index}`}>
                <td>{index + 1}</td>
                <td>{doc.name}</td>
                <td>
                  <FaCheckCircle color="green" size="1.5em" />
                </td>
                <td>
                  <Button variant="info" className="m-1" onClick={() => handleViewDocument(doc.filename!)}>
                    View
                  </Button>
                  <Button variant="info" className="m-1" onClick={() => handleDownloadDocument(doc.filename!)}>
                    Download
                  </Button>
                  <Button variant="danger" className="m-1" onClick={() => handleDeleteSingleDocument(doc.filename!)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      {uploadedDocs?.length > 0 && (
        <Container className="mt-5 d-flex justify-content-between">
          <Button className="m-1" variant="danger" onClick={handleDelete}>
            <FaTrash /> Delete All Documents
          </Button>
          <Button className="m-1" variant="info" onClick={handleDownload}>
            <FaDownload /> Download All Documents
          </Button>
        </Container>
      )}
      {selectedPdf && (
        <Modal show={true} onHide={() => setSelectedPdf(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>PDF Viewer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={pdfWrapperRef} className="pdf-wrapper">
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
    </>
  );
};

export default AddLeadChecklist;
