import { Column } from 'react-table'
import { PageSize } from '@/components'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import { usePermissions, userApi } from '@/common'
import { RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { hasPermission } from '@/utils'
import { useUserImage } from '@/hooks'

interface UserListHookResult {
	columns: ReadonlyArray<Column>
	sizePerPageList: PageSize[]
	userRecords: User[]
	loading: boolean
}

export const useUserList = (): UserListHookResult => {
	const navigate = useNavigate()
	const fetchUserImage = useUserImage()
	const { permissions } = usePermissions()
	const [loading, setLoading] = useState(true)
	const [userRecords, setUserRecords] = useState<User[]>([])

	const columns = [
		{
			Header: 'S.No',
			accessor: 'sno',
			defaultCanSort: true,
		},
		{
			Header: 'ID',
			accessor: 'id',
			defaultCanSort: true,
		},
		{
			Header: 'Profile Image',
			accessor: 'profileImage',
			disableSortBy: true,
			Cell: ({ cell }: any) => (
				<img
					src={cell.value}
					alt="Profile Image"
					style={{
						width: 50,
						height: 50,
						borderRadius: '50%',
						objectFit: 'cover',
					}}
				/>
			),
		},
		{
			Header: 'Firstname',
			accessor: 'firstname',
			defaultCanSort: true,
		},
		{
			Header: 'Lastname',
			accessor: 'lastname',
			defaultCanSort: false,
		},
		{
			Header: 'Email',
			accessor: 'email',
			defaultCanSort: true,
		},
		{
			Header: 'Phone',
			accessor: 'phone',
			defaultCanSort: false,
		},
		{
			Header: 'City',
			accessor: 'city',
			defaultCanSort: false,
			Cell: ({ cell }: any) => (
				<span>{cell.value || 'N/A'}</span>
			),
		},
		{
			Header: 'Address',
			accessor: 'address',
			defaultCanSort: false,
			Cell: ({ cell }: any) => (
				<span>{cell.value || 'N/A'}</span>
			),
		},
		{
			Header: 'Role',
			accessor: 'role',
			defaultCanSort: false,
		},
	]

	if (hasPermission(permissions, 'Users', 'Update')) {
		columns.push({
			Header: 'Edit',
			accessor: 'edit',
			disableSortBy: true,
			Cell: ({ cell }: any) => (
				<RiEdit2Line
					size={24}
					color="#007bff"
					cursor="pointer"
					onClick={() => handleEdit(cell.row.original.id, cell.row.original)}
				/>
			),
		})
	}

	if (hasPermission(permissions, 'Users', 'Delete')) {
		columns.push({
			Header: 'Delete',
			accessor: 'delete',
			disableSortBy: true,
			Cell: ({ cell }: any) => (
				<RiDeleteBinLine
					size={24}
					color="#dc3545"
					cursor="pointer"
					onClick={() => handleDelete(cell.row.original.id)}
				/>
			),
		})
	}

	const handleEdit = (userId: string, userData: any) => {
		if (hasPermission(permissions, 'Users', 'Update')) {
			navigate(`/user/edit/${userId}`, { state: { userData } })
		}
	}

	const handleDelete = async (userId: string) => {
		if (hasPermission(permissions, 'Users', 'Delete')) {
			await userApi.delete(userId)
			const updatedUserRecords = userRecords.filter(
				(user) => user.id !== userId
			)
			setUserRecords(updatedUserRecords)
			toast.success('User deleted successfully.')
		}
	}

	const sizePerPageList: PageSize[] = [
		{
			text: '5',
			value: 5,
		},
		{
			text: '10',
			value: 10,
		},
		{
			text: '25',
			value: 25,
		},
		{
			text: 'All',
			value: userRecords.length,
		},
	]

	useEffect(() => {
		const getUsers = async () => {
			setLoading(true)
			const userData = await userApi.get()
			const usersWithImages = await Promise.all(
				userData?.users.map(async (user: User, index: any) => {
					const imageUrl = await fetchUserImage(user)
					return { ...user, profileImage: imageUrl, sno: index + 1 }
				})
			)
			setUserRecords(usersWithImages)
			setLoading(false)
		}

		getUsers()
	}, [])

	useEffect(() => {
		return () => {
			userRecords.forEach((user) => {
				if (
					user.profileImage &&
					!document.querySelector(`img[src="${user.profileImage}"]`)
				) {
					URL.revokeObjectURL(user.profileImage)
				}
			})
		}
	}, [userRecords])

	return { columns, sizePerPageList, userRecords, loading }
}
