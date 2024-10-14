import classNames from 'classnames'
import {
	Dispatch,
	forwardRef,
	RefObject,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	Column,
	FilterValue,
	useAsyncDebounce,
	useGlobalFilter,
	usePagination,
	useRowSelect,
	useSortBy,
	useTable,
} from 'react-table'
import styles from './Table.module.css'

interface TableProps {
	isSortable?: boolean
	isSearchable?: boolean
	pagination?: boolean
	isSelectable?: boolean
	columns: ReadonlyArray<Column<any>>
	data: any[]
	pageSize?: number
	setSelectedUserIds: Dispatch<SetStateAction<string[]>>
	toggleAllRowsSelected: (val: (selected: boolean) => void) => void
}

type GlobalFilterProps = {
	preGlobalFilteredRows: any
	globalFilter: any
	setGlobalFilter: (filterValue: FilterValue) => void
	searchBoxClass?: string
}

const GlobalFilter = ({
	preGlobalFilteredRows,
	globalFilter,
	setGlobalFilter,
	searchBoxClass,
}: GlobalFilterProps) => {
	const count = preGlobalFilteredRows.length
	const [value, setValue] = useState<any>(globalFilter)
	const onChange = useAsyncDebounce((value) => {
		setGlobalFilter(value || undefined)
	}, 200)

	return (
		<div className={classNames(searchBoxClass)}>
			<span className="d-flex align-items-center">
				Search :{' '}
				<input
					value={value || ''}
					onChange={(e) => {
						setValue(e.target.value)
						onChange(e.target.value)
					}}
					placeholder={`${count} records...`}
					className="form-control w-auto ms-1"
				/>
			</span>
		</div>
	)
}

const IndeterminateCheckbox = forwardRef<
	HTMLInputElement,
	{ indeterminate?: boolean }
>(({ indeterminate, ...rest }, ref) => {
	const defaultRef = useRef<HTMLInputElement>(null)
	const resolvedRef =
		ref && typeof ref === 'object'
			? (ref as RefObject<HTMLInputElement>)
			: defaultRef

	useEffect(() => {
		if (resolvedRef && resolvedRef.current) {
			resolvedRef.current.indeterminate = Boolean(indeterminate)
		}
	}, [resolvedRef, indeterminate])

	return (
		<input
			type="checkbox"
			className="form-check-input"
			ref={resolvedRef}
			{...rest}
		/>
	)
})

const getSavedPaginationState = () => {
	const savedPageIndex = localStorage.getItem('paginationPageIndex')
	const savedPageSize = localStorage.getItem('paginationPageSize')
	return {
		pageIndex: savedPageIndex ? Number(savedPageIndex) : 0,
		pageSize: savedPageSize ? Number(savedPageSize) : 5,
	}
}

const Table = ({
	isSortable = false,
	pagination = false,
	isSelectable = false,
	isSearchable = false,
	columns,
	data,
	pageSize,
	setSelectedUserIds,
	toggleAllRowsSelected,
}: TableProps) => {
	const location = useLocation()
	const initialState = getSavedPaginationState()
	const [pageIndex, setPageIndex] = useState<number>(initialState.pageIndex)
	const [currentData, setCurrentData] = useState<any[]>(data)

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		pageOptions,
		gotoPage,
		canPreviousPage,
		canNextPage,
		page,
		state: { selectedRowIds, globalFilter },
		preGlobalFilteredRows,
		setGlobalFilter,
		toggleAllRowsSelected: internalToggleAllRowsSelected,
	} = useTable(
		{
			columns,
			data: currentData,
			initialState: {
				pageIndex: initialState.pageIndex,
				pageSize: initialState.pageSize,
			},
			autoResetPage: false,
		},
		...(isSearchable ? [useGlobalFilter] : []),
		...(isSortable ? [useSortBy] : []),
		...(pagination ? [usePagination] : []),
		...(isSelectable ? [useRowSelect] : []),
		(hooks) => {
			isSelectable &&
				hooks.visibleColumns.push((columns) => [
					{
						id: 'selection',
						Header: ({ getToggleAllRowsSelectedProps }) => (
							<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
						),
						Cell: ({ row }) => (
							<IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
						),
					},
					...columns,
				])
		}
	)

	const handlePageChange = (newPageIndex: number) => {
		gotoPage(newPageIndex)
		setPageIndex(newPageIndex)
	}

	const dynamicRows = pagination ? page : rows

	toggleAllRowsSelected(internalToggleAllRowsSelected)

	useEffect(() => {
		localStorage.setItem('paginationPageIndex', String(pageIndex))
		localStorage.setItem('paginationPageSize', String(pageSize))
	}, [pageIndex, pageSize])

	useEffect(() => {
		return () => {
			localStorage.removeItem('paginationPageIndex')
			localStorage.removeItem('paginationPageSize')
		}
	}, [location])

	// Update the selected user IDs when rows are selected/unselected
	useEffect(() => {
		const selectedUserIds = page
			.filter((row) => selectedRowIds[row.id])
			.map((row) => row.original.id)
		setSelectedUserIds(selectedUserIds)
	}, [page, selectedRowIds, setSelectedUserIds])

	// Handle page change if the current page becomes empty after data changes (e.g., deletion)
	useEffect(() => {
		if (dynamicRows.length === 0 && pageIndex > 0) {
			// If no rows are present in the current page, navigate to the last page that has data
			gotoPage(pageIndex - 1)
			setPageIndex(pageIndex - 1)
		}
	}, [dynamicRows.length, pageIndex, gotoPage])

	// Update the current data when external data changes
	useEffect(() => {
		setCurrentData(data)
	}, [data])

	return (
		<>
			{isSearchable && (
				<GlobalFilter
					preGlobalFilteredRows={preGlobalFilteredRows}
					globalFilter={globalFilter}
					setGlobalFilter={setGlobalFilter}
				/>
			)}
			<div className={`table-responsive ${styles.tableStyles}`}>
				<table
					className={`table table-centered react-table`}
					{...getTableProps()}>
					<thead>
						{headerGroups.map((headerGroup) => {
							const { key, ...restHeaderGroupProps } =
								headerGroup.getHeaderGroupProps()
							return (
								<tr key={key} {...restHeaderGroupProps}>
									{headerGroup.headers.map((column) => {
										const { key, ...restHeaderProps } = column.getHeaderProps(
											isSortable ? column.getSortByToggleProps() : {}
										)
										return (
											<th key={key} {...restHeaderProps}>
												{column.render('Header')}
												{isSortable && (
													<span>
														{column.isSorted
															? column.isSortedDesc
																? ' 🔽'
																: ' 🔼'
															: ''}
													</span>
												)}
											</th>
										)
									})}
								</tr>
							)
						})}
					</thead>
					<tbody {...getTableBodyProps()}>
						{dynamicRows.map((row) => {
							prepareRow(row)
							const { key, ...restRowProps } = row.getRowProps()
							return (
								<tr key={key} {...restRowProps}>
									{row.cells.map((cell) => {
										const { key, ...restCellProps } = cell.getCellProps()
										return (
											<td key={key} {...restCellProps}>
												{cell.render('Cell')}
											</td>
										)
									})}
								</tr>
							)
						})}
					</tbody>
				</table>
				{rows.length === 0 && (
					<div className={styles.noDataMessage}>
						<p>No data available</p>
					</div>
				)}
			</div>
			{pagination && (
				<div className="d-lg-flex align-items-center text-center pb-1">
					<span className="me-3">
						Page{' '}
						<strong>
							{pageIndex + 1} of {pageOptions.length}
						</strong>{' '}
					</span>
					<ul className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0">
						<li key="prevpage">
							<Link
								to="#"
								className={`page-link ${!canPreviousPage ? 'disabled' : ''}`}
								onClick={() => handlePageChange(pageIndex - 1)}>
								<i className="mdi mdi-chevron-left"></i>
							</Link>
						</li>
						{Array.from({ length: pageOptions.length }, (_, index) => (
							<li key={index}>
								<Link
									to="#"
									className={`page-link ${pageIndex === index ? 'active' : ''}`}
									onClick={() => handlePageChange(index)}>
									{index + 1}
								</Link>
							</li>
						))}
						<li key="nextpage">
							<Link
								to="#"
								className={`page-link ${!canNextPage ? 'disabled' : ''}`}
								onClick={() => handlePageChange(pageIndex + 1)}>
								<i className="mdi mdi-chevron-right"></i>
							</Link>
						</li>
					</ul>
				</div>
			)}
		</>
	)
}

export { Table }
