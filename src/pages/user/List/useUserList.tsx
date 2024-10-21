import { useEffect, useMemo, useState } from 'react';
import { Column } from 'react-table';
import { User } from '@/types';
import { usePermissions, userApi } from '@/common';
import { toast } from 'react-toastify';
import { RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useUserImage } from '@/hooks';
import { hasPermission } from '@/utils';
import { formatStringDisplayName } from '@/utils/formatString';

interface UserListHookResult {
	columns: ReadonlyArray<Column<any>>;
	userRecords: User[];
	loading: boolean;
	getUsers: () => void;
}

export const useUserList = (): UserListHookResult => {
	const navigate = useNavigate();
	const fetchUserImage = useUserImage();
	const { permissions } = usePermissions();
	const [loading, setLoading] = useState(true);
	const [userRecords, setUserRecords] = useState<User[]>([]);

	const handleEdit = (userId: string, userData: any) => {
		if (hasPermission(permissions, 'Users', 'Update')) {
			navigate(`/user/edit/${userId}`, { state: { userData } });
		}
	};

	const handleDelete = async (userId: string) => {
		if (hasPermission(permissions, 'Users', 'Delete')) {
			await userApi.delete(userId);
			setUserRecords((prev) => prev.filter((user) => user.id !== userId));
			toast.success('User deleted successfully.');
		}
	};

	const columns = useMemo(() => {
		const baseColumns = [
			{ Header: 'S.No', accessor: 'sno', defaultCanSort: true },
			{ Header: 'ID', accessor: 'id', defaultCanSort: true },
			{
				Header: 'Profile Image',
				accessor: 'profileImage',
				disableSortBy: true,
				Cell: ({ cell }: any) => (
					<img src={cell.value} alt="Profile" className="rounded-circle" style={{ width: 50, height: 50, objectFit: 'cover' }} />
				),
			},
			{ Header: 'Firstname', accessor: 'firstname', defaultCanSort: true },
			{ Header: 'Lastname', accessor: 'lastname', defaultCanSort: false },
			{ Header: 'Email', accessor: 'email', defaultCanSort: true },
			{ Header: 'Phone', accessor: 'phone', defaultCanSort: false },
			{ Header: 'City', accessor: 'city', defaultCanSort: false, Cell: ({ cell }: any) => <span>{cell.value || 'N/A'}</span> },
			{ Header: 'Address', accessor: 'address', defaultCanSort: false, Cell: ({ cell }: any) => <span>{cell.value || 'N/A'}</span> },
			{ Header: 'Role', accessor: 'role', defaultCanSort: false, Cell: ({ cell }: any) => <span>{formatStringDisplayName(cell.value)}</span> },
		];

		if (hasPermission(permissions, 'Users', 'Update')) {
			baseColumns.push({
				Header: 'Edit',
				accessor: 'edit',
				disableSortBy: true,
				Cell: ({ cell }: any) => (
					<RiEdit2Line size={24} color="#007bff" cursor="pointer" onClick={() => handleEdit(cell.row.original.id, cell.row.original)} />
				),
			});
		}

		if (hasPermission(permissions, 'Users', 'Delete')) {
			baseColumns.push({
				Header: 'Delete',
				accessor: 'delete',
				disableSortBy: true,
				Cell: ({ cell }: any) => (
					<RiDeleteBinLine size={24} color="#dc3545" cursor="pointer" onClick={() => handleDelete(cell.row.original.id)} />
				),
			});
		}

		return baseColumns;
	}, [permissions]);

	const getUsers = async () => {
		setLoading(true);
		try {

			const userData = await userApi.get();
			const usersWithImages = await Promise.all(
				userData.users.map(async (user: User, index: number) => {
					const imageUrl = await fetchUserImage(user);
					return { ...user, profileImage: imageUrl, sno: index + 1 };
				})
			);
			setUserRecords(usersWithImages);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getUsers();
	}, []);

	return { columns, userRecords, loading, getUsers };
};
