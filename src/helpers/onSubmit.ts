import React from 'react'
import { safeResponseData } from 'resource-endpoint'

export interface OnSubmitOptions {
  makeRequest: (inputs: any) => Promise<any>
  useState: [any, React.Dispatch<React.SetStateAction<any>>]
  onError?: (errors: any, onSubmit: (event: React.FormEvent) => Promise<void>) => void
  onSuccess?: (payload: any) => Promise<any>
  initialState?: Record<string, any>
}

const validateStatus = (status: number): boolean => {
  return status >= 200 && status < 300
}

export function createOnSubmit(options: OnSubmitOptions): (event: React.FormEvent) => Promise<void> {
  const [values, setValues] = options.useState
  return async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setValues({ ...values, isLoading: true })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { errors, isLoading, message, ...inputs } = values
    const response = await options.makeRequest(inputs)
    const data = safeResponseData(response)
    if (data.errors) {
      setValues({
        ...values,
        errors: data.errors,
        isLoading: false,
      })
      if (typeof options.onError !== 'function') {
        return
      }
      return options.onError(data.errors, onSubmit)
    } else if (!validateStatus(response.status) && data.message) {
      return setValues({ ...values, message: data.message, isLoading: false })
    }
    if (typeof options.onSuccess === 'function') {
      await options.onSuccess(data)
    } else {
      setValues({ ...options.initialState, isLoading: false })
    }
  }
}
