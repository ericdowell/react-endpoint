import React from 'react'
import { node } from 'prop-types'
import { StateAction, StateActionCases, StateProviderHelpers, StateProviderProps } from './types'
import { applyReducerState } from './helpers'

export function createStateProvider<S, R extends React.Reducer<any, any>>(options: {
  initialState: S
  actions: Record<string, string>
  actionCases?: StateActionCases<S>
  providerHelpers?: (dispatch: React.Dispatch<React.ReducerAction<R>>) => StateProviderHelpers
}): [
  React.Context<{
    dispatch: React.Dispatch<React.ReducerAction<R>>
    helpers: any
    state: S
  }>,
  (props: StateProviderProps) => React.ReactElement<
    React.ProviderProps<{
      dispatch: React.Dispatch<React.ReducerAction<R>>
      helpers: any
      state: S
    }>
  >,
] {
  type ProviderProps = {
    dispatch: React.Dispatch<React.ReducerAction<R>>
    helpers: any
    state: S
  }
  if (!options.actions || typeof options.actions !== 'object' || Object.keys(options.actions).length === 0) {
    throw new Error("A valid 'actions' option must be provided.")
  }
  const actionTypes = Object.values(options.actions)
  const knownActions = JSON.stringify(actionTypes)
  const Context = React.createContext<ProviderProps>({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dispatch: (value: any): void => undefined, // StateProvider will have correct Reducer dispatch function
    helpers: {}, // StateProvider will have correct helper functions
    state: options.initialState, // dispatch/state will be maintained by Reducer provided in StateProvider going forward
  })
  function StateProvider(props: StateProviderProps): React.ReactElement<React.ProviderProps<ProviderProps>> {
    const [state, dispatch] = React.useReducer((prevState: S, action: StateAction): any => {
      if (!actionTypes.includes(action.type)) {
        throw new Error(`Unknown action: "${action.type}", known actions: ${knownActions}`)
      }
      if (typeof options?.actionCases?.[action.type] !== 'function') {
        return applyReducerState(prevState, action)
      }
      return options.actionCases[action.type](prevState, action)
    }, options.initialState)
    return (
      <Context.Provider
        value={{
          dispatch,
          helpers: typeof options?.providerHelpers === 'function' ? options.providerHelpers(dispatch) : {},
          state,
        }}
      >
        {props.children}
      </Context.Provider>
    )
  }
  StateProvider.propTypes = {
    children: node.isRequired,
  }
  return [Context, StateProvider]
}
