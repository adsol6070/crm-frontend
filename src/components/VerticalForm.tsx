import React from 'react'
import { FieldValues, Resolver, useForm } from 'react-hook-form'

interface VerticalFormProps<TFormValues extends FieldValues> {
	defaultValues?: any
	resolver?: Resolver<TFormValues>
	children: React.ReactNode;
    onSubmit: (data: TFormValues, methods: any) => void;
	formClass?: string
}

const VerticalForm = <
	TFormValues extends Record<string, any> = Record<string, any>,
>({
	defaultValues,
	resolver,
	children,
	onSubmit,
	formClass,
}: VerticalFormProps<TFormValues>) => {
	/*
	 * form methods
	 */
	const methods = useForm<TFormValues>({ defaultValues, resolver })

	const {
		handleSubmit,
		reset,
		register,
		control,
		formState: { errors },
	} = methods
    // Wrap onSubmit to provide form methods as the second parameter
    const handleFormSubmit = (data: TFormValues) => {
        onSubmit(data, methods);  // Pass entire methods object to onSubmit
    };
	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className={formClass} noValidate>
			{Array.isArray(children)
				? children.map((child) => {
						return child.props && child.props.name
							? React.createElement(child.type, {
									...{
										...child.props,
										register,
										key: child.props.name,
										errors,
										control,
										reset,
									},
							  })
							: child
				  })
				: children}
		</form>
	)
}

export default VerticalForm
