# react-endpoint
Experimental package, preventing re-renders has not been optimized. Some of the helper functions may be of use,
use Components with caution.

Added React.js logic on top of the [resource-endpoint](https://github.com/ericdowell/resource-endpoint) package.

### Examples

### Using RequestForm in React Login Component
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

### Using createStateProvider

```js
// js/context/index.js
import { createStateProvider } from 'react-endpoint'
import { api } from '../api'
import { fetchCsrfCookie } from '../helpers'

export const actions = {
    FLASH_MESSAGE: 'flashMessage',
    HANDLE_ERROR_MODALS: 'handleErrorModals',
    PASSWORD_CONFIRMED: 'passwordConfirmedAt',
    SET_USER: 'user',
    APP_INITIALIZE: 'initialized',
    SHOW_AUTHENTICATE_MODAL: 'mustAuthenticate',
    SHOW_CONFIRM_PASSWORD_MODAL: 'mustConfirmPassword',
}

export const [Context, StateProvider] = createStateProvider({
    initialState: {
        flashMessage: null,
        initialized: false,
        mustAuthenticate: false,
        mustConfirmPassword: false,
        passwordConfirmedAt: window.demo.passwordConfirmedAt,
        user: window.demo.user,
    },
    actions,
    providerHelpers: (dispatch) => ({
        /**
         * Helper function that reduces effort to call Reducer dispatch function.
         *
         * @param {string} action
         * @param {*} payload
         * @returns {void}
         */
        dispatchAction: function (action, payload) {
            return dispatch({ type: action, [action]: payload })
        },

        /**
         * TODO: Modals sometimes create re-renders, this is not great, maybe there's
         *       another way to prevent this by using a different global state.
         *
         * Handle showing a modal in specific error cases.
         *
         * @param {*} payload
         * @returns {void}
         */
        modal: function (payload) {
            return this.dispatchAction(actions.HANDLE_ERROR_MODALS, payload)
        },

        /**
         * Initialize user globally.
         *
         * @returns {void}
         */
        initializeUser: function () {
            api.user.current().then((response) => {
                if (response.status === 200) {
                    this.setUser(response.data.user)
                } else if (response.status !== 401) {
                    window.console.error('error when calling user.current()', response)
                }
                this.dispatchAction(actions.SHOW_AUTHENTICATE_MODAL, false)
                this.dispatchAction(actions.APP_INITIALIZE, true)
            })
        },

        /**
         * Set user globally.
         *
         * @param {*} user
         * @returns {void}
         */
        setUser: function (user) {
            // NOTE: Need to get a new (valid) CSRF Cookie after user has been logged out.
            if (!user) {
                fetchCsrfCookie()
            }
            return this.dispatchAction(actions.SET_USER, user)
        },

        /**
         * Flashing a message on pages that support it.
         *
         * @param {string} message
         * @param {number} timeout
         * @returns {void}
         */
        flash: function (message, timeout = 3000) {
            // TODO: Add slow css transition to fade out text
            setTimeout(() => this.dispatchAction(actions.FLASH_MESSAGE, null), timeout)
            return this.dispatchAction(actions.FLASH_MESSAGE, message)
        },
    }),
})
```