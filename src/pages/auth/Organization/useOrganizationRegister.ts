import { authApi } from '@/common/api';
import { useAuthContext } from '@/common/context';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OrganizationData {
  organizationName: string;
}

export default function useRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const registerOrganization = async (data: OrganizationData) => {
    const userData = data;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('organization', userData.organizationName);

      const response = await authApi.createOrganization(formData);
      const dbDetails = response.dbConnection;
      const tenantId = response.tenantID;

      const swalHtml = `
        <div>
          <p>Registration Successful</p>
          <p>Organization ID: ${tenantId}</p>
          <p>Organization Name: ${dbDetails.user}</p>
          <p>Password: ${dbDetails.password}</p>
          <p>Database Name: ${dbDetails.database}</p>
          <button id="copyButton" style="border:none; background:transparent; cursor:pointer;">
            <i class="bi bi-clipboard" style="font-size: 1.2em;"></i>
          </button>
        </div>
      `;

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        html: swalHtml,
        showConfirmButton: true,
        confirmButtonText: 'Next',
        didOpen: () => {
          const copyButton = document.getElementById('copyButton');
          copyButton?.addEventListener('click', () => {
            const textToCopy = `${tenantId}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
              Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Organization ID has been copied to clipboard.',
                timer: 1000,
                showConfirmButton: false,
              });
            });
          });
        },
      }).then(() => {
        navigate('/auth/register');
      });

    } catch (error) {
      console.error('Registration failed', error);
      const errorMessage = 'Registration failed. Please try again.';

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, registerOrganization, isAuthenticated };
}
