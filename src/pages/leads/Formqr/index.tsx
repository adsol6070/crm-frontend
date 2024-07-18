import React from 'react';
import { PageBreadcrumb } from '@/components';
import { Container, Button, Spinner } from 'react-bootstrap';
import useFormqr from './useFormqr'; 
import styles from './formqr.module.css';

const Formqr: React.FC = () => {
    const { qrCodeUrl, loading, downloadQRCode } = useFormqr();

    return (
        <>
            <PageBreadcrumb title="Form QR" subName="Leads" />
            <Container className={styles.containerDesign}>
                {loading ? (
                    <div className="text-center" style={{height: "500px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    qrCodeUrl && (
                        <div className={`qr-container ${styles.qrcontainerDesign}`}>
                            <img src={qrCodeUrl} alt="QR Code" className={styles.qrImgDesign} />
                            <Button onClick={downloadQRCode}>Download QR Code</Button>
                        </div>
                    )
                )}
            </Container>
        </>
    );
};

export default Formqr;
