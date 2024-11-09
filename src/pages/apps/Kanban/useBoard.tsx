import { boardApi } from '@/common'
import { Board } from '@/types'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const useBoard = () => {
	const [loading, setLoading] = useState(true)
	const [boards, setBoards] = useState([])

	const getBoards = async () => {
		setLoading(true)
		try {
			const boardsData = await boardApi.getAllBoards()
			setBoards(boardsData)
		} catch (err) {
			console.error('Failed to get boards:', err)
			toast.error('Failed to get boards')
		} finally {
			setLoading(false)
		}
	}

	const createBoard = async (data: Board) => {
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

	const deleteBoardById = async (id: string) => {
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
		getBoards,
		createBoard,
		boards,
		deleteBoardById,
		deleteAllBoards,
	}
}

export default useBoard
