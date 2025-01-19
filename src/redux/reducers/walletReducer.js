import {
    FETCH_WALLET_BALANCE_REQUEST,
    FETCH_WALLET_BALANCE_SUCCESS,
    FETCH_WALLET_BALANCE_FAILURE,
    WITHDRAW_FUNDS_REQUEST,
    WITHDRAW_FUNDS_SUCCESS,
    WITHDRAW_FUNDS_FAILURE,
    ADD_BANK_ACCOUNT_REQUEST,
    ADD_BANK_ACCOUNT_SUCCESS,
    ADD_BANK_ACCOUNT_FAILURE,
  } from '../actions/walletActionTypes';
  
  const initialState = {
    walletBalance: 0,
    transactions: [],
    bankAccounts: [],
    loading: false,
    error: null,
  };
  
  const walletReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_WALLET_BALANCE_REQUEST:
      case WITHDRAW_FUNDS_REQUEST:
      case ADD_BANK_ACCOUNT_REQUEST:
        return { ...state, loading: true, error: null };
  
      case FETCH_WALLET_BALANCE_SUCCESS:
        return {
          ...state,
          loading: false,
          walletBalance: action.payload.balance,
          transactions: action.payload.transactions,
        };
  
      case WITHDRAW_FUNDS_SUCCESS:
        return { ...state, loading: false, transactions: [action.payload, ...state.transactions] };
  
      case ADD_BANK_ACCOUNT_SUCCESS:
        return { ...state, loading: false, bankAccounts: [...state.bankAccounts, action.payload] };
  
      case FETCH_WALLET_BALANCE_FAILURE:
      case WITHDRAW_FUNDS_FAILURE:
      case ADD_BANK_ACCOUNT_FAILURE:
        return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  };
  
  export default walletReducer;
  