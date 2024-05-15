import { useState, useEffect } from 'react';
import { userApi } from '@/common/api';
import { useAuthContext } from '@/common/context';
import { toast } from 'react-toastify';

interface UserData {
  id: string;
  tenantID: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  role: string;
  profileImage?: string;
}

const useEditUser = (userId?: string) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          throw new Error('User ID is missing.');
        }

        const data = (await userApi.getUserById(userId)) as UserData;
        if (data) {
          delete data.password;
          setUserData(data);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load the user data.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError('User ID is missing.');
      setLoading(false);
    }
  }, [userId]);

  const editUser = async (updatedData: FormData) => {
    setLoading(true);
    try {
      const data = await userApi.update(updatedData, userId);
      toast.success(data.message);
      setUserData((prev) => (prev ? { ...prev, ...data.user } : null));
    } catch (err: any) {
      console.error('Failed to update user data:', err);
      toast.error(err.message);
      setError('Failed to update the user data.');
    } finally {
      setLoading(false);
    }
  };

  return { userData, loading, error, editUser, isAuthenticated };
};

export default useEditUser;
