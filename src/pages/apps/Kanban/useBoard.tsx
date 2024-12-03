import { boardApi } from '@/common'
import { Board } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const useBoard = () => {
	const [boards, setBoards] = useState<Board[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	const getBoards = async () => {
		setLoading(true)
		try {
			const boardsData = await boardApi.getAllBoards()
			setBoards(boardsData)
		} catch (err) {
			console.error('Failed to get boards:', err)
		} finally {
			setLoading(false)
		}
	}

	const createBoard = async (data: Partial<Board>) => {
		setLoading(true)
		try {
			const response = await boardApi.createBoard(data)
			await getBoards()
			toast.success(response.message)
		} catch (err) {
			console.error('Failed to create board:', err)
			toast.error('Failed to create board')
		} finally {
			setLoading(false)
		}
	}

	const updateBoard = async (id: string, updatedData: Partial<Board>) => {
		setLoading(true)
		try {
			const response = await boardApi.updateBoardByID(id, updatedData)
			await getBoards()
			toast.success(response.message || 'Board updated successfully')
		} catch (err) {
			console.error('Failed to update board:', err)
			toast.error('Failed to update board')
		} finally {
			setLoading(false)
		}
	}

	const updateBoardOrder = async (updatedBoards: any[]) => {
		setLoading(true)
		try {
			await boardApi.updateBoardOrder({
				orderedBoards: updatedBoards,
			})
			await getBoards()
		} catch (err) {
			console.error('Failed to update board order:', err)
			toast.error('Failed to update board order')
		} finally {
			setLoading(false)
		}
	}

	const deleteBoard = async (id: string) => {
		setLoading(true)
		try {
			await boardApi.deleteBoardByID(id)
			await getBoards()
		} catch (err) {
			console.error('Failed to delete board:', err)
			toast.error('Failed to delete board')
		} finally {
			setLoading(false)
		}
	}

	const deleteAllBoards = async () => {
		setLoading(true)
		try {
			await boardApi.deleteBoards()
			await getBoards()
		} catch (err) {
			console.error('Failed to delete boards:', err)
			toast.error('Failed to delete boards')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getBoards()
	}, [])

	return {
		loading,
		boards,
		setBoards,
		getBoards,
		createBoard,
		updateBoard,
		updateBoardOrder,
		deleteBoard,
		deleteAllBoards,
	}
}

export default useBoard
