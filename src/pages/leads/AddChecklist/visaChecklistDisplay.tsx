import React, { useState } from 'react';
import { Card, Table, Button, Form } from 'react-bootstrap';
import styles from './AddVisaChecklists.module.css';
import { useVisaChecklist } from './useVisaChecklists';
import { ChecklistItem } from '@/types';
import Swal from 'sweetalert2';
import { capitalizeFirstLetterOfEachWord, hasPermission } from '@/utils';
import { usePermissions } from '@/common';
import { FaClock } from 'react-icons/fa';

interface VisaChecklistDisplayProps {
    id: string;
    visaType: string;
    checklists: ChecklistItem[];
}

const VisaChecklistDisplay: React.FC<VisaChecklistDisplayProps> = ({ id, visaType, checklists }) => {
    const { deleteChecklists, updateChecklists } = useVisaChecklist();
    const { permissions } = usePermissions();
    const [localChecklists, setLocalChecklists] = useState<ChecklistItem[]>(checklists);
    const [newDocument, setNewDocument] = useState<ChecklistItem>({ name: '', required: true });
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editDocument, setEditDocument] = useState<ChecklistItem>({ name: '', required: true });

    const handleDeleteChecklist = async (id: string) => {
        await deleteChecklists(id);
    };

    const handleAddDocument = async () => {
        if (newDocument.name.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter document name',
            });
            return;
        }
        const updatedChecklists = [...localChecklists, newDocument];
        setLocalChecklists(updatedChecklists);
        await updateChecklists(id, updatedChecklists);
        setNewDocument({ name: '', required: true });
    };

    const handleDeleteDocument = async (index: number) => {
        const updatedChecklists = localChecklists.filter((_, i) => i !== index);
        setLocalChecklists(updatedChecklists);
        await updateChecklists(id, updatedChecklists);
    };

    const handleEditDocument = (index: number) => {
        setEditIndex(index);
        setEditDocument(localChecklists[index]);
    };

    const handleSaveEdit = async () => {
        const updatedChecklists = localChecklists.map((item, index) =>
            index === editIndex ? editDocument : item
        );
        setLocalChecklists(updatedChecklists);
        setEditIndex(null);
        await updateChecklists(id, updatedChecklists);
    };

    const canEditOrDelete = hasPermission(permissions, 'Checklists', 'EditDocument') || hasPermission(permissions, 'Checklists', 'DeleteDocument');

    return (
        <Card className={styles.card}>
            <Card.Header>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h5>{capitalizeFirstLetterOfEachWord(visaType)} Checklist</h5>
                    {hasPermission(permissions, 'Checklists', 'DeleteChecklist') && (
                    <Button variant="danger" onClick={() => handleDeleteChecklist(id)}>
                        <i className="ri-delete-bin-6-line"></i>
                    </Button>)}
                </div>
            </Card.Header>
            <Card.Body>
                <Table bordered hover responsive className={styles.table}>
                    <thead>
                        <tr>
                            <th>Document Name</th>
                            <th>Status</th>
                           {canEditOrDelete && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {localChecklists.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {editIndex === index ? (
                                        <Form.Control
                                            type="text"
                                            value={editDocument.name}
                                            onChange={(e) => setEditDocument({ ...editDocument, name: e.target.value })}
                                        />
                                    ) : (
                                        item.name
                                    )}
                                </td>
                                {/* <td>{item.required ? 'Yes' : 'No'}</td> */}
                                <td><FaClock className={styles.clockIcon} /></td>
                                {canEditOrDelete &&
                                <td>
                                    {editIndex === index ? (
                                        <div className={styles.actionButtons}>
                                            <Button variant="success" onClick={handleSaveEdit} className={styles.actionButton}>
                                                <i className="ri-check-line"></i>
                                            </Button>
                                            <Button variant="secondary" onClick={() => setEditIndex(null)} className={styles.actionButton}>
                                                <i className="ri-close-line"></i>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className={styles.actionButtons}>
                                            {hasPermission(permissions, 'Checklists', 'EditDocument') && (
                                            <Button variant="warning" onClick={() => handleEditDocument(index)} className={styles.actionButton}>
                                                <i className="ri-edit-line"></i>
                                            </Button>)}
                                            {hasPermission(permissions, 'Checklists', 'DeleteDocument') && (
                                            <Button variant="danger" onClick={() => handleDeleteDocument(index)} className={styles.actionButton}>
                                                <i className="ri-delete-bin-6-line"></i>
                                            </Button>)}
                                        </div>
                                    )}
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {hasPermission(permissions, 'Checklists', 'AddDocument') && (
                <Form className={styles.addDocumentForm}>
                    <Form.Group controlId="documentName" className='my-1'>
                        <Form.Label>Document Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter document name"
                            value={newDocument.name}
                            onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value, required: true })}
                        />
                    </Form.Group>
                    <Button variant="primary" className='my-1' onClick={handleAddDocument}>
                        <i className="ri-add-line"></i> Add Document
                    </Button>
                </Form>
                )}
            </Card.Body>
        </Card>
    );
};

export default VisaChecklistDisplay;
