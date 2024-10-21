import { useThemeContext } from '@/common'
import { phoneStyle } from '@/utils'
import { Country } from 'country-state-city'
import { useState, InputHTMLAttributes, useEffect } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import { FieldErrors, Control } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface PasswordInputProps {
	name: string
	placeholder?: string
	refCallback?: any
	errors: FieldErrors
	control?: Control<any>
	register?: any
	className?: string
}

const PasswordInput = ({
	name,
	placeholder,
	refCallback,
	errors,
	register,
	className,
}: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	return (
		<InputGroup className="mb-0">
			<Form.Control
				type={showPassword ? 'text' : 'password'}
				placeholder={placeholder}
				name={name}
				id={name}
				as="input"
				ref={(r: HTMLInputElement) => {
					if (refCallback) refCallback(r)
				}}
				className={className}
				isInvalid={errors && errors[name] ? true : false}
				{...(register ? register(name) : {})}
				autoComplete={name}
			/>
			<div
				className={`input-group-text input-group-password ${showPassword ? 'show-password' : ''}`}
				data-password={showPassword ? 'true' : 'false'}>
				<span
					className="password-eye"
					onClick={() => {
						setShowPassword(!showPassword)
					}}></span>
			</div>
		</InputGroup>
	)
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	type?: string
	name: string
	placeholder?: string
	register?: any
	errors?: any
	labelContainerClassName?: string
	control?: Control<any>
	className?: string
	labelClassName?: string
	containerClass?: string
	isTerms?: boolean
	refCallback?: any
	children?: any
	rows?: number
	reset?: any
	phoneNumber?: string
	setValue?: any
	watch?: any
	trigger?: any
}

const FormInput = ({
	label,
	type,
	name,
	placeholder,
	register,
	errors,
	control,
	className,
	labelClassName,
	labelContainerClassName,
	containerClass,
	isTerms = false,
	refCallback,
	children,
	phoneNumber,
	rows,
	setValue,
	watch,
	trigger,
	...otherProps
}: FormInputProps) => {
	const { settings }: any = useThemeContext()
	const comp =
		type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input'
	const { ...restProps } = otherProps
	const [initialCountry, setInitialCountry] = useState<string>('in')

	useEffect(() => {
		if (phoneNumber) {
			const countryCodeMatch = phoneNumber.match(/^\+(\d+)/)
			if (countryCodeMatch && countryCodeMatch[1]) {
				const countryCode = countryCodeMatch[1]
				const country = Country.getAllCountries().find(
					(c) => c.phonecode === countryCode
				)
				if (country) {
					setInitialCountry(country.isoCode.toLowerCase())
				}
			}
		}
	}, [phoneNumber])

	const handlePhoneChange = (value: string, data: any) => {
		const val = value.slice(data.dialCode.length)
		const formattedData = `+${data.dialCode} ${val}`
		setValue(name, formattedData)
		trigger(name)
		if (refCallback) refCallback(formattedData)
	}

	return (
		<>
			{type === 'hidden' ? (
				<input
					type={type}
					name={name}
					{...(register ? register(name) : {})}
					{...restProps}
				/>
			) : (
				<>
					{type === 'password' ? (
						<Form.Group className={containerClass}>
							{label ? (
								<div className={labelContainerClassName}>
									<Form.Label className={labelClassName}>{label}</Form.Label>
									{children}
								</div>
							) : null}
							<PasswordInput
								name={name}
								placeholder={placeholder}
								refCallback={refCallback}
								errors={errors!}
								register={register}
								className={className}
							/>
							{errors && errors[name] ? (
								<Form.Control.Feedback type="invalid" className="d-block">
									{errors[name]['message']}
								</Form.Control.Feedback>
							) : null}
						</Form.Group>
					) : type === 'phone' ? (
						<Form.Group className={containerClass}>
							{label ? (
								<Form.Label className={labelClassName}>{label}</Form.Label>
							) : null}

							<PhoneInput
								country={initialCountry}
								placeholder={placeholder}
								enableSearch={true}
								prefix="+"
								countryCodeEditable={true}
								value={watch(name)}
								onChange={handlePhoneChange}
								inputProps={{
									name: name,
									autoComplete: 'phone',
									style: {
										...phoneStyle(settings.theme === 'dark', errors, name),
									},
								}}
							/>
							{errors && errors[name] ? (
								<div
									className="text-danger"
									style={{ fontSize: '12px', marginTop: '3px' }}>
									{errors[name]['message']}
								</div>
							) : null}
						</Form.Group>
					) : (
						<Form.Group className={containerClass}>
							{label ? (
								<Form.Label className={labelClassName}>{label}</Form.Label>
							) : null}

							<Form.Control
								type={type}
								placeholder={placeholder}
								name={name}
								id={name}
								as={comp}
								ref={(r: HTMLInputElement) => {
									if (refCallback) refCallback(r)
								}}
								className={className}
								isInvalid={errors && errors[name] ? true : false}
								{...(register ? register(name) : {})}
								rows={rows}
								{...restProps}
								autoComplete={name}>
								{children ? children : null}
							</Form.Control>

							{errors && errors[name] ? (
								<Form.Control.Feedback type="invalid">
									{errors[name]['message']}
								</Form.Control.Feedback>
							) : null}
						</Form.Group>
					)}
				</>
			)}
		</>
	)
}

export default FormInput
