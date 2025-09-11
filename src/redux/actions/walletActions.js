import axios from 'axios';
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
} from './walletActionTypes';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Fetch Wallet Balance
export const fetchWalletBalance = () => async (dispatch) => {
  dispatch({ type: FETCH_WALLET_BALANCE_REQUEST });

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/wallet/data`);
    dispatch({ type: FETCH_WALLET_BALANCE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_WALLET_BALANCE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Withdraw Funds
export const withdrawFunds = (amount, accountNumber) => async (dispatch) => {
  dispatch({ type: WITHDRAW_FUNDS_REQUEST });

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/wallet/withdraw`, {
      amount,
      accountNumber,
    });
    dispatch({ type: WITHDRAW_FUNDS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: WITHDRAW_FUNDS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Add Bank Account
export const addBankAccount = (bankDetails) => async (dispatch) => {
  dispatch({ type: ADD_BANK_ACCOUNT_REQUEST });

  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/wallet/bank`, bankDetails);
    dispatch({ type: ADD_BANK_ACCOUNT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ADD_BANK_ACCOUNT_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};
