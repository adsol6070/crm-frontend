import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from '../LeadList.module.css';
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord, historyStyle } from '@/utils';
import { useThemeContext } from '@/common';

interface Agent {
    id: string;
    firstname: string;
    lastname: string;
}

interface HistoryItem {
    action: string;
    timestamp: string;
    details?: {
        createdBy?: { firstname: string; lastname: string };
        updatedBy?: { firstname: string; lastname: string };
        statusUpdatedBy?: { firstname: string; lastname: string };
        previousStatus?: string;
        upcomingStatus?: string;
        assignedAgents?: Agent[];
    };
}

interface HistoryModalProps {
    show: boolean;
    onHide: () => void;
    historyData: HistoryItem[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ show, onHide, historyData }) => {
    const { settings } = useThemeContext();
    const getStatusClass = (status: string | null) => {
        switch (status) {
            case 'pending':
                return styles.pendingStatus;
            case 'inprogress':
                return styles.inProgressStatus;
            case 'completed':
                return styles.completedStatus;
            default:
                return styles.noStatus;
        }
    };
    
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Lead History</Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                <div className={styles.stepper}>
                    {historyData.map((item, index) => (
                        <div key={index} className={styles.step} style={historyStyle(settings.theme === "dark")}>
                            <div className={styles.stepNumber}>{index + 1}</div>
                            <div className={styles.stepContent}>
                                <h5 className={styles.action}>{capitalizeFirstLetterOfEachWord(item.action)}</h5>
                                {item.details?.statusUpdatedBy && (
                                    <div className={styles.statusChange}>
                                        <div className={styles.statusProgress}>
                                            <div className={styles.statusCircleWrapper}>
                                                <div className={`${styles.statusCircle} ${getStatusClass(String(item.details.previousStatus))}`}>
                                                    {capitalizeFirstLetter(item.details.previousStatus === null ? "New" : String(item.details.previousStatus))}
                                                </div>
                                                <div className={styles.statusLine}></div>
                                                <div className={`${styles.statusCircle} ${getStatusClass(String(item.details.upcomingStatus))}`}>
                                                    {capitalizeFirstLetter(item.details.upcomingStatus || '')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</p>
                                {item.details?.assignedAgents && item.details.assignedAgents.length > 0 && (
                                    <div className={styles.assignedAgents}>
                                        <h6 className={styles.assignedAgentsTitle}>Assigned Agents:</h6>
                                        <ul className={styles.assignedAgentsList}>
                                            {item.details.assignedAgents.map(agent => (
                                                agent ? (
                                                    <li key={agent.id} className={styles.agentItem}>
                                                        <span className={styles.agentName}>
                                                            {capitalizeFirstLetter(agent.firstname)} {capitalizeFirstLetter(agent.lastname)}
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
