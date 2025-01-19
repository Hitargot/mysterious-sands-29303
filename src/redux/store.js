import { combineReducers, applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import walletReducer from './reducers/walletReducer';

const rootReducer = combineReducers({
  wallet: walletReducer,
  // Add other reducers here
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
