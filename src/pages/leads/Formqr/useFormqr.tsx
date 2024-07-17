import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuthContext } from '@/common';

const useFormqr = () => {
    const { user } = useAuthContext();
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const generateQRCode = async () => {
            setLoading(true);
            try {
                const url = await QRCode.toDataURL(`${process.env.VITE_FRONTEND_URL}/pages/createLead?tenantID=${user.tenantID}`, { width: 500 });
                setQrCodeUrl(url);
            } catch (error) {
                console.error('Error generating QR code', error);
            } finally {
                setLoading(false);
            }
        };

        generateQRCode();
    }, []);

    const downloadQRCode = () => {
        if (qrCodeUrl) {
            const a = document.createElement('a');
            a.href = qrCodeUrl;
            a.download = 'qrcode.png';
            a.click();
        }
    };

    return { qrCodeUrl, loading, downloadQRCode };
};

export default useFormqr;
