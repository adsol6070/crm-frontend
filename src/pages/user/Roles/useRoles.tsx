import { BsPencil, BsTrash } from 'react-icons/bs'

const sampleData = [
	{
		roleTitle: 'Admin',
		users: 10,
		createdOn: '2024-05-01',
		updatedOn: '2024-05-01',
	},
	{
		roleTitle: 'User',
		users: 100,
		createdOn: '2024-05-02',
		updatedOn: '2024-05-02',
	},
]

export const useRoles = () => {
	const columns = [
		{ Header: 'Role Title', accessor: 'roleTitle', defaultCanSort: true },
		{ Header: 'Users', accessor: 'users' },
		{ Header: 'Created On', accessor: 'createdOn' },
		{ Header: 'Updated On', accessor: 'updatedOn' },
		{ Header: 'Action', Cell: ActionsCell },
	]

	return { columns, sampleData }
}

const ActionsCell = () => (
	<div>
		<span className="me-2">
			<BsPencil color="blue" cursor="pointer" />
		</span>
		<span>
			<BsTrash color="red" cursor="pointer" />
		</span>
	</div>
)
