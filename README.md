# react-endpoint

Added React.js logic on top of the [resource-endpoint](https://github.com/ericdowell/resource-endpoint) package.

### Examples

### Using RequestForm in React Login Component
Then in your client app you can do the following:
```jsx
// js/pages/Login.jsx
import React from 'react'
import { RequestForm, useFormChange } from 'resource-endpoint'
import { api } from '../api'

export const Login = (props) => {
    const initialState = {
        errors: {},
        email: '',
        password: '',
        remember: false,
    }
    const [onChange, values, setValues] = useFormChange(initialState)
    const makeRequest = (inputs) => api.auth.login(inputs)
    const onSuccess = ({ user }) => {
        if (!user) {
            setValues({
                ...values,
                errors: {
                    message:
                        'Something went wrong. Please try again.',
                },
            })
            return
        }
        setValues(initialState)
        props.loginUser(user)
    }
    return (
        <RequestForm makeRequest={makeRequest} onSuccess={onSuccess} setValues={setValues} values={values}>
            {/* TODO: Error handling, display error messages */}
            <input type="email" name="email" value={values.email} onChange={onChange} />
            <input type="password" name="password" value={values.password} onChange={onChange} />
            <input type="checkbox" name="remember" checked={values.remember} onChange={onChange} />
            <input type="submit" value="Login" />
        </RequestForm>
    )
}
```
