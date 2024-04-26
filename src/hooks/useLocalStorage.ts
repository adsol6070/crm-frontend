import { useCallback, useState } from 'react'

// Custom hook for handling local storage
export default function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			console.error('Error loading from localStorage', error)
			return initialValue
		}
	})

	const setValue = useCallback(
		(value: T) => {
			try {
				setStoredValue(value)
				window.localStorage.setItem(key, JSON.stringify(value))
			} catch (error) {
				console.error('Error saving to localStorage', error)
			}
		},
		[key]
	)

	return [storedValue, setValue]
}
