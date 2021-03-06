import React from 'react'
import { RequestForm } from '../../components'
import { act, render, fireEvent } from '@testing-library/react'

describe('<RequestForm />', (): void => {
  it('renders successfully', async (): Promise<void> => {
    expect.assertions(2)
    const setValues = jest.fn()
    const values = { foo: 'bar' }
    const rendered = render(
      <RequestForm makeRequest={async (): Promise<any> => ({})} values={values} setValues={setValues}>
        <h1>Title</h1>
        <input type="submit" data-testid="submit" />
      </RequestForm>,
    )
    expect(setValues).toHaveBeenCalledTimes(0)
    expect(rendered.container).toMatchInlineSnapshot(`
      <div>
        <form>
          <h1>
            Title
          </h1>
          <input
            data-testid="submit"
            type="submit"
          />
        </form>
      </div>
    `)
  })

  describe('fireEvent.click(submit)', (): void => {
    it('calls default setValues functions', async (): Promise<void> => {
      expect.assertions(1)
      const setValues = jest.fn()
      const values = { foo: 'bar' }
      const rendered = render(
        <RequestForm makeRequest={async (): Promise<any> => ({})} values={values} setValues={setValues}>
          <h1>Title</h1>
          <input type="submit" data-testid="submit" />
        </RequestForm>,
      )
      await act(async (): Promise<void> => {
        fireEvent.click(await rendered.findByTestId('submit'))
      })
      expect(setValues).toHaveBeenCalledTimes(2)
    })

    describe('successfully results in', (): void => {
      it('onSuccess function called', async (): Promise<void> => {
        expect.assertions(3)
        const onSuccess = jest.fn()
        const setValues = jest.fn()
        const values = { foo: 'bar' }
        const data = { foo: 'bar' }
        const rendered = render(
          <RequestForm
            onSuccess={onSuccess}
            setValues={setValues}
            values={values}
            makeRequest={async (): Promise<any> => ({ data })}
          >
            <h1>Title</h1>
            <input type="submit" data-testid="submit" />
          </RequestForm>,
        )
        await act(async (): Promise<void> => {
          fireEvent.click(await rendered.findByTestId('submit'))
        })
        expect(setValues).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenLastCalledWith(data)
      })

      it('default data.errors function block', async (): Promise<void> => {
        expect.assertions(2)
        const onSuccess = jest.fn()
        const setValues = jest.fn()
        const values = { foo: 'bar' }
        const data = { errors: { foo: 'bar' } }
        const rendered = render(
          <RequestForm
            onSuccess={onSuccess}
            setValues={setValues}
            values={values}
            makeRequest={async (): Promise<any> => ({ data })}
          >
            <h1>Title</h1>
            <input type="submit" data-testid="submit" />
          </RequestForm>,
        )
        await act(async (): Promise<void> => {
          fireEvent.click(await rendered.findByTestId('submit'))
        })
        expect(setValues).toHaveBeenCalledTimes(2)
        expect(onSuccess).toHaveBeenCalledTimes(0)
      })

      it('onError being called', async (): Promise<void> => {
        expect.assertions(3)
        const onError = jest.fn()
        const onSuccess = jest.fn()
        const setValues = jest.fn()
        const values = { foo: 'bar' }
        const data = { errors: { foo: 'bar' } }
        const rendered = render(
          <RequestForm
            onError={onError}
            onSuccess={onSuccess}
            setValues={setValues}
            values={values}
            makeRequest={async (): Promise<any> => ({ data })}
          >
            <h1>Title</h1>
            <input type="submit" data-testid="submit" />
          </RequestForm>,
        )
        await act(async (): Promise<void> => {
          fireEvent.click(await rendered.findByTestId('submit'))
        })
        expect(setValues).toHaveBeenCalledTimes(2)
        expect(onError).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledTimes(0)
      })
    })
  })
})
