import { useState, useEffect } from 'react';
import { useAuthContext } from '@/common';
import html2canvas from 'html2canvas';

const useFormqr = () => {
    const { user } = useAuthContext();
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const generateQRCodeUrl = () => {
            setLoading(true);
            try {
                const url = encodeURI(`${process.env.VITE_FRONTEND_URL}/pages/createLead?tenantID=${user.tenantID}`);
                setQrCodeUrl(url);
            } catch (error) {
                console.error('Error generating QR code URL', error);
            } finally {
                setLoading(false);
            }
        };

        generateQRCodeUrl();
    }, [user]);

    const downloadQRCode = async (qrRef: React.RefObject<HTMLDivElement>) => {
        if (qrRef.current) {
            const canvas = await html2canvas(qrRef.current);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'qrcode.png';
            link.click();
        }
    };

    return { qrCodeUrl, loading, downloadQRCode };
};

export default useFormqr;
