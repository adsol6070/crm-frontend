// import React, { useRef, useEffect, forwardRef, useState } from 'react'
// import {
// 	useTable,
// 	useSortBy,
// 	usePagination,
// 	useRowSelect,
// 	useGlobalFilter,
// 	useAsyncDebounce,
// 	useExpanded,
// 	Column,
// 	Row,
// 	FilterValue,
// } from 'react-table'
// import classNames from 'classnames'
// import { Pagination, PageSize } from './Pagination'
// import styles from './Table.module.css'

// export type CellFormatter<T extends Object = {}> = {
// 	row: Row<T>
// }

// type GlobalFilterProps = {
// 	preGlobalFilteredRows: any
// 	globalFilter: any
// 	setGlobalFilter: (filterValue: FilterValue) => void
// 	searchBoxClass?: string
// }

// const GlobalFilter = ({
// 	preGlobalFilteredRows,
// 	globalFilter,
// 	setGlobalFilter,
// 	searchBoxClass,
// }: GlobalFilterProps) => {
// 	const count = preGlobalFilteredRows.length
// 	const [value, setValue] = useState<any>(globalFilter)
// 	const onChange = useAsyncDebounce((value) => {
// 		setGlobalFilter(value || undefined)
// 	}, 200)

// 	return (
// 		<div className={classNames(searchBoxClass)}>
// 			<span className="d-flex align-items-center">
// 				Search :{' '}
// 				<input
// 					value={value || ''}
// 					onChange={(e) => {
// 						setValue(e.target.value)
// 						onChange(e.target.value)
// 					}}
// 					placeholder={`${count} records...`}
// 					className="form-control w-auto ms-1"
// 				/>
// 			</span>
// 		</div>
// 	)
// }

// type IndeterminateCheckboxProps = {
// 	indeterminate: any
// 	children?: React.ReactNode
// }

// const IndeterminateCheckbox = forwardRef<
// 	HTMLInputElement,
// 	IndeterminateCheckboxProps
// >(({ indeterminate, ...rest }, ref) => {
// 	const defaultRef = useRef()
// 	const resolvedRef: any = ref || defaultRef

// 	useEffect(() => {
// 		resolvedRef.current.indeterminate = indeterminate
// 	}, [resolvedRef, indeterminate])

// 	return (
// 		<div className="form-check">
// 			<input
// 				type="checkbox"
// 				className="form-check-input"
// 				ref={resolvedRef}
// 				{...rest}
// 			/>
// 			<label htmlFor="form-check-input" className="form-check-label"></label>
// 		</div>
// 	)
// })

// type TableProps<TableValues> = {
// 	isSearchable?: boolean
// 	isSortable?: boolean
// 	pagination?: boolean
// 	isSelectable?: boolean
// 	isExpandable?: boolean
// 	sizePerPageList?: PageSize[]
// 	columns: ReadonlyArray<Column>
// 	data: TableValues[]
// 	pageSize?: number
// 	searchBoxClass?: string
// 	tableClass?: string
// 	theadClass?: string
// }

// const Table = <TableValues extends object = {}>(
// 	props: TableProps<TableValues>
// ) => {
// 	const isSearchable = props['isSearchable'] || false
// 	const isSortable = props['isSortable'] || false
// 	const pagination = props['pagination'] || false
// 	const isSelectable = props['isSelectable'] || false
// 	const isExpandable = props['isExpandable'] || false
// 	const sizePerPageList = props['sizePerPageList'] || []

// 	let otherProps: any = {}

// 	if (isSearchable) {
// 		otherProps['useGlobalFilter'] = useGlobalFilter
// 	}
// 	if (isSortable) {
// 		otherProps['useSortBy'] = useSortBy
// 	}
// 	if (isExpandable) {
// 		otherProps['useExpanded'] = useExpanded
// 	}
// 	if (pagination) {
// 		otherProps['usePagination'] = usePagination
// 	}
// 	if (isSelectable) {
// 		otherProps['useRowSelect'] = useRowSelect
// 	}

// 	const dataTable = useTable(
// 		{
// 			columns: props['columns'],
// 			data: props['data'],
// 			initialState: { pageSize: props['pageSize'] || 10 },
// 		},

// 		otherProps.hasOwnProperty('useGlobalFilter') &&
// 			otherProps['useGlobalFilter'],
// 		otherProps.hasOwnProperty('useSortBy') && otherProps['useSortBy'],
// 		otherProps.hasOwnProperty('useExpanded') && otherProps['useExpanded'],
// 		otherProps.hasOwnProperty('usePagination') && otherProps['usePagination'],
// 		otherProps.hasOwnProperty('useRowSelect') && otherProps['useRowSelect'],

// 		(hooks) => {
// 			isSelectable &&
// 				hooks.visibleColumns.push((columns) => [
// 					// Let's make a column for selection
// 					{
// 						id: 'selection',
// 						// The header can use the table's getToggleAllRowsSelectedProps method
// 						// to render a checkbox
// 						Header: ({ getToggleAllPageRowsSelectedProps }: any) => (
// 							<div>
// 								<IndeterminateCheckbox
// 									{...getToggleAllPageRowsSelectedProps()}
// 								/>
// 							</div>
// 						),
// 						// The cell can use the individual row's getToggleRowSelectedProps method
// 						// to the render a checkbox
// 						Cell: ({ row }: any) => (
// 							<div>
// 								<IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
// 							</div>
// 						),
// 					},
// 					...columns,
// 				])

// 			isExpandable &&
// 				hooks.visibleColumns.push((columns) => [
// 					// Let's make a column for selection
// 					{
// 						// Build our expander column
// 						id: 'expander', // Make sure it has an ID
// 						Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
// 							<span {...getToggleAllRowsExpandedProps()}>
// 								{isAllRowsExpanded ? '-' : '+'}
// 							</span>
// 						),
// 						Cell: ({ row }) =>
// 							// Use the row.canExpand and row.getToggleRowExpandedProps prop getter
// 							// to build the toggle for expanding a row
// 							row.canExpand ? (
// 								<span
// 									{...row.getToggleRowExpandedProps({
// 										style: {
// 											// We can even use the row.depth property
// 											// and paddingLeft to indicate the depth
// 											// of the row
// 											paddingLeft: `${row.depth * 2}rem`,
// 										},
// 									})}>
// 									{row.isExpanded ? '-' : '+'}
// 								</span>
// 							) : null,
// 					},
// 					...columns,
// 				])
// 		}
// 	)

// 	let rows = pagination ? dataTable.page : dataTable.rows

// 	return (
// 		<>
// 			{isSearchable && (
// 				<GlobalFilter
// 					preGlobalFilteredRows={dataTable.preGlobalFilteredRows}
// 					globalFilter={dataTable.state.globalFilter}
// 					setGlobalFilter={dataTable.setGlobalFilter}
// 					searchBoxClass={props['searchBoxClass']}
// 				/>
// 			)}

// 			<div className={`table-responsive ${styles.tableStyles}`}>
// 				<table
// 					{...dataTable.getTableProps()}
// 					className={classNames(
// 						'table table-centered react-table',
// 						props['tableClass']
// 					)}>
// 					<thead className={props['theadClass']}>
// 						{dataTable.headerGroups.map((headerGroup) => (
// 							<tr {...headerGroup.getHeaderGroupProps()}>
// 								{headerGroup.headers.map((column: any) => (
// 									<th
// 										{...column.getHeaderProps(
// 											column.defaultCanSort && column.getSortByToggleProps()
// 										)}
// 										className={classNames({
// 											sorting_desc: column.isSortedDesc === true,
// 											sorting_asc: column.isSortedDesc === false,
// 											sortable: column.defaultCanSort === true,
// 										})}>
// 										{column.render('Header')}
// 									</th>
// 								))}
// 							</tr>
// 						))}
// 					</thead>
// 					<tbody {...dataTable.getTableBodyProps()}>
// 						{(rows || []).map((row, i) => {
// 							dataTable.prepareRow(row)
// 							return (
// 								<tr {...row.getRowProps()}>
// 									{row.cells.map((cell) => {
// 										return (
// 											<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
// 										)
// 									})}
// 								</tr>
// 							)
// 						})}
// 					</tbody>
// 				</table>
// 				{rows.length === 0 && (
// 					<div className={styles.noDataMessage}>
//                                     <p>No data available</p>
// 					</div>
//                         )}
// 			</div>

// 			{pagination && (
// 				<Pagination tableProps={dataTable} sizePerPageList={sizePerPageList} />
// 			)}
// 		</>
// 	)
// }

// export { Table }

import classNames from 'classnames'
import {
	Dispatch,
	forwardRef,
	RefObject,
	SetStateAction,
	useEffect,
	useRef,
} from 'react'
import { Link } from 'react-router-dom'
import {
	Column,
	usePagination,
	useRowSelect,
	useSortBy,
	useTable,
} from 'react-table'

interface TableProps {
	isSortable?: boolean
	pagination?: boolean
	isSelectable?: boolean
	columns: ReadonlyArray<Column<any>>
	data: any[]
	pageSize?: number
	setSelectedUserIds: Dispatch<SetStateAction<string[]>>
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
	columns,
	data,
	pageSize,
	setSelectedUserIds,
}: TableProps) => {
	const initialState = getSavedPaginationState()

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
		state: { selectedRowIds, pageIndex },
	} = useTable(
		{
			columns,
			data,
			initialState: {
				pageIndex: initialState.pageIndex,
				pageSize: initialState.pageSize,
			},
		},
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

	useEffect(() => {
		localStorage.setItem('paginationPageIndex', String(pageIndex))
		localStorage.setItem('paginationPageSize', String(pageSize))
	}, [pageIndex, pageSize])

	useEffect(() => {
		const selectedUserIds = page
			.filter((row) => selectedRowIds[row?.id])
			.map((row) => row.original.id)
		setSelectedUserIds(selectedUserIds)
	}, [page, selectedRowIds, setSelectedUserIds])

	const handlePageChange = (newPageIndex: number) => {
		gotoPage(newPageIndex)
	}

	const dynamicRows = pagination ? page : rows

	return (
		<>
			<div className={`table-responsive`}>
				<table
					{...getTableProps()}
					className="table table-centered react-table">
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map((column) => (
									<th
										{...column.getHeaderProps(
											isSortable ? column.getSortByToggleProps() : {}
										)}
										className={classNames({
											sorting_desc: column.isSortedDesc === true,
											sorting_asc: column.isSortedDesc === false,
											sortable: column.defaultCanSort === true,
										})}>
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
								))}
							</tr>
						))}
					</thead>
					<tbody {...getTableBodyProps()}>
						{dynamicRows.map((row) => {
							prepareRow(row)
							return (
								<tr {...row.getRowProps()}>
									{row.cells.map((cell) => (
										<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
									))}
								</tr>
							)
						})}
					</tbody>
				</table>
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
