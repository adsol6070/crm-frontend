import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// assets
import enFlag from './flags/us.jpg'
import germanyFlag from './flags/germany.jpg'
import italyFlag from './flags/italy.jpg'
import spainFlag from './flags/spain.jpg'
import russiaFlag from './flags/russia.jpg'

// Define the available languages and their flags
const Languages = [
	{
		code: 'en',
		name: 'English',
		flag: enFlag,
	},
	{
		code: 'gr',
		name: 'German',
		flag: germanyFlag,
	},
	{
		code: 'it',
		name: 'Italian',
		flag: italyFlag,
	},
	{
		code: 'sp',
		name: 'Spanish',
		flag: spainFlag,
	},
	{
		code: 'rs',
		name: 'Russian',
		flag: russiaFlag,
	},
	{
		code: 'hi',
		name: 'Hindi',
		flag: russiaFlag,
	},
	{
		code: 'pa',
		name: 'Punjabi',
		flag: russiaFlag,
	},
]

const LanguageDropdown: React.FC = () => {
	const { i18n } = useTranslation()
	const currentLang =
		Languages.find((lang) => lang.code === i18n.language) || Languages[0]
	const [dropDownOpen, setDropDownOpen] = useState<boolean>(false)

	const toggleDropDown = () => {
		setDropDownOpen(!dropDownOpen)
	}

	const changeLanguage = (languageCode: string) => {
		i18n.changeLanguage(languageCode)
		setDropDownOpen(false)
	}

	return (
		<Dropdown show={dropDownOpen} onToggle={toggleDropDown}>
			<Dropdown.Toggle
				className="nav-link dropdown-toggle arrow-none"
				as="a"
				role="button"
				onClick={toggleDropDown}>
				<img
					src={currentLang.flag}
					alt="user-avatar"
					className="me-0 me-sm-1"
					height="12"
				/>
				<span className="align-middle d-none d-lg-inline-block">
					{currentLang.name}
				</span>
				<i className="ri-arrow-down-s-line d-none d-sm-inline-block align-middle" />
			</Dropdown.Toggle>

			<Dropdown.Menu className="dropdown-menu dropdown-menu-end dropdown-menu-animated">
				{Languages.map((lang, idx) => (
					<Link
						to="#"
						className="dropdown-item"
						key={`${idx}-lang`}
						onClick={() => changeLanguage(lang.code)}>
						<img src={lang.flag} alt={lang.name} className="me-1" height="12" />
						<span className="align-middle">{lang.name}</span>
					</Link>
				))}
			</Dropdown.Menu>
		</Dropdown>
	)
}

export default LanguageDropdown
