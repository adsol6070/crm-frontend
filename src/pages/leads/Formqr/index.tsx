import React, { useRef } from 'react';
import { PageBreadcrumb } from '@/components';
import { Container, Button, Spinner } from 'react-bootstrap';
import useFormqr from './useFormqr';
import styles from './formqr.module.css';
import QRCode from 'react-qr-code';

const Formqr: React.FC = () => {
    const { qrCodeUrl, loading, downloadQRCode } = useFormqr();
    const qrRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <PageBreadcrumb title="Form QR" subName="Leads" />
            <Container className={styles.containerDesign}>
                {loading ? (
                    <div className="text-center" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    qrCodeUrl && (
                        <div ref={qrRef} className={`qr-container ${styles.qrcontainerDesign}`}>
                            <QRCode className="my-2" value={qrCodeUrl} size={256}  level="H" />
                            <Button onClick={() => downloadQRCode(qrRef)}>Download QR Code</Button>
                        </div>
                    )
                )}
            </Container>
        </>
    );
};

export default Formqr;
