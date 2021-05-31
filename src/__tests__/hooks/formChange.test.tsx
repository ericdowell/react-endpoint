import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestRequestForm } from './TestRequestForm'

describe('useFormChange', (): void => {
  it('useFormChange onChange correctly updates values', async (): Promise<void> => {
    expect.assertions(2)
    const makeRequest = jest.fn().mockResolvedValue({ data: {} })
    const rendered = render(
      <TestRequestForm makeRequest={makeRequest}>
        <h1>Title</h1>
      </TestRequestForm>,
    )
    await act(async (): Promise<void> => {
      fireEvent.click(await rendered.findByTestId('contact-phone'))
      const email = await rendered.findByTestId('email')
      userEvent.clear(email)
      userEvent.type(email, 'test@example.net')
      const username = await rendered.findByTestId('username')
      userEvent.clear(username)
      userEvent.type(username, 'Mr. Dirt')
      fireEvent.change(await rendered.findByTestId('state'), { target: { name: 'state', value: 'IL' } })
      fireEvent.click(await rendered.findByTestId('remember'))
      fireEvent.click(await rendered.findByTestId('submit'))
    })
    expect(makeRequest).toHaveBeenCalledTimes(1)
    expect(makeRequest.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "_token": "asdfa;lvwpoeinvdsafkasldfas",
          "contact": "phone",
          "email": "test@example.net",
          "remember": true,
          "state": "IL",
          "username": "Mr. Dirt",
        },
      ]
    `)
  })
})
