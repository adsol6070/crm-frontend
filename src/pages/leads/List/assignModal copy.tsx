import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image, ListGroup } from 'react-bootstrap';
import { User } from '@/types';
import useGetLeadAssignee from './useGetLeadAssignes';

interface AssignModalProps {
  show: boolean;
  handleClose: () => void;
  handleAssign: (leadId: string, assignees: string[]) => void;
  leadId: string;
  users: User[];
}

const AssignModal: React.FC<AssignModalProps> = ({ show, handleClose, handleAssign, leadId, users }) => {
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  console.log("SelectedAssignees:", selectedAssignees);

  const { leadAssignee } = useGetLeadAssignee(leadId);

  // Reset selected assignees when modal is shown or leadAssignee changes
  useEffect(() => {
    if (show) {
      if (leadAssignee && leadAssignee.user_id) {
        setSelectedAssignees(leadAssignee.user_id);
      } else {
        setSelectedAssignees([]);
      }
    }
  }, [show, leadAssignee]);

  const handleCheckboxChange = (userId: string) => {
    setSelectedAssignees(prevState =>
      prevState.includes(userId)
        ? prevState.filter(id => id !== userId)
        : [...prevState, userId]
    );
  };

  const capitalizeFirstLetter = (str: string | undefined) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const onAssign = () => {
    const checkedAssignees = selectedAssignees.filter(id => users.some(user => user.id === id));
    handleAssign(leadId, checkedAssignees);
    handleClose();
  };

  const filteredUsers = users.filter(user => user.role !== 'superAdmin');

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Assign Lead</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <ListGroup>
            {filteredUsers.map(user => (
              <label key={user.id} htmlFor={`checkbox-${user.id}`} className="d-flex align-items-center list-group-item list-group-item-action" style={{ cursor: 'pointer' }}>
                <Image
                  src={user.profileImage}
                  roundedCircle
                  style={{ width: 40, height: 40, marginRight: 15 }}
                  alt={`${user.firstname} ${user.lastname}`}
                />
                <div className="flex-grow-1">
                  <div>{capitalizeFirstLetter(user.firstname)} {capitalizeFirstLetter(user.lastname)}</div>
                  <small>{capitalizeFirstLetter(user.role)}</small>
                </div>
                <Form.Check
                  id={`checkbox-${user.id}`}
                  type="checkbox"
                  value={user.id}
                  checked={selectedAssignees.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                  style={{ pointerEvents: 'none' }}
                />
              </label>
            ))}
          </ListGroup>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onAssign}>
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignModal;
