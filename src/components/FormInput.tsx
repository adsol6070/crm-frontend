import { useThemeContext } from '@/common';
import { phoneStyle } from '@/utils';
import { useState, InputHTMLAttributes } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FieldErrors, Control, useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PasswordInputProps {
  name: string;
  placeholder?: string;
  refCallback?: any;
  errors: FieldErrors;
  control?: Control<any>;
  register?: any;
  className?: string;
}

const PasswordInput = ({
  name,
  placeholder,
  refCallback,
  errors,
  register,
  className,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <InputGroup className="mb-0">
      <Form.Control
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        name={name}
        id={name}
        as="input"
        ref={(r: HTMLInputElement) => {
          if (refCallback) refCallback(r);
        }}
        className={className}
        isInvalid={errors && errors[name] ? true : false}
        {...(register ? register(name) : {})}
        autoComplete={name}
      />
      <div
        className={`input-group-text input-group-password ${showPassword ? 'show-password' : ''}`}
        data-password={showPassword ? 'true' : 'false'}
      >
        <span
          className="password-eye"
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        ></span>
      </div>
    </InputGroup>
  );
};

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  register?: any;
  errors?: any;
  labelContainerClassName?: string;
  control?: Control<any>;
  className?: string;
  labelClassName?: string;
  containerClass?: string;
  isTerms?: boolean;
  refCallback?: any;
  children?: any;
  rows?: number;
  reset?: any;
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
  rows,
  ...otherProps
}: FormInputProps) => {
  const { settings }: any = useThemeContext();
  const { setValue, watch } = useForm();
  const comp = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';
  const { ...restProps } = otherProps;

  const handlePhoneChange = (value: string, data: any) => {
    const val = value.slice(data.dialCode.length)
    const formattedData = `+${data.dialCode} ${val}`
    setValue(name, formattedData);
    if (refCallback) refCallback(formattedData);
  };

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
                country={'in'}
                placeholder={placeholder}
                enableSearch={true}
                prefix="+"
                countryCodeEditable={true}
                value={watch(name)}
                onChange={handlePhoneChange}
                inputProps={{
                  name: name,
                  required: true,
                  autoComplete: 'phone',
                  style: {...phoneStyle(settings.theme === "dark")},
                  className: `form-control ${errors && errors[name] ? 'is-invalid' : ''}`,
                  ...restProps,
                }}
              />
              {errors && errors[name] ? (
                <Form.Control.Feedback type="invalid">
                  {errors[name]['message']}
                </Form.Control.Feedback>
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
                  if (refCallback) refCallback(r);
                }}
                className={className}
                isInvalid={errors && errors[name] ? true : false}
                {...(register ? register(name) : {})}
                rows={rows}
                {...restProps}
                autoComplete={name}
              >
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
  );
};

export default FormInput;
