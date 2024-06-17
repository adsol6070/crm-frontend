import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './LeadList.module.css';

interface HistoryItem {
    action: string;
    timestamp: string;
    details?: {
        assignedAgents?: { id: string; firstname: string; lastname: string }[];
    };
}

interface HistoryModalProps {
    show: boolean;
    onHide: () => void;
    historyData: HistoryItem[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ show, onHide, historyData }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Lead History</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                <div className={styles.stepper}>
                    {historyData.map((item, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepNumber}>{index + 1}</div>
                            <div className={styles.stepContent}>
                                <h5 className={styles.action}>{item.action}</h5>
                                <p className={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</p>
                                {item.details?.assignedAgents && item.details.assignedAgents.length > 0 && (
                                    <div className={styles.assignedAgents}>
                                        <h6 className={styles.assignedAgentsTitle}>Assigned Agents:</h6>
                                        <ul className={styles.assignedAgentsList}>
                                            {item.details.assignedAgents.map(agent => (
                                                agent ? (
                                                    <li key={agent.id} className={styles.agentItem}>
                                                        <span className={styles.agentName}>
                                                            {agent.firstname} {agent.lastname}
                                                        </span>
                                                    </li>
                                                ) : null
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={onHide}>Close</button>
            </Modal.Footer>
        </Modal>
    );
};

export default HistoryModal;
