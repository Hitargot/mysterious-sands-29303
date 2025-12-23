
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import styled from 'styled-components';
import logo from '../assets/images/IMG_940.PNG';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg,#f0f7ff 0%, #eef8ff 100%);
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 12px 36px rgba(6,10,30,0.12);
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
`;

const LogoImg = styled.img`
  height: 48px;
  width: auto;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #162660;
`;

const Desc = styled.p`
  margin: 6px 0 0 0;
  color: #475569;
  font-size: 13px;
`;

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  color: #334155;
  margin-bottom: 6px;
`;

const InputWrap = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  box-sizing: border-box;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 8px;
  top: 6px;
  bottom: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0 8px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Remember = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
`;

const Button = styled.button`
  background: #162660;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const Message = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
`;

export default function AdminLogin() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [tempPasswordExpiry, setTempPasswordExpiry] = useState(null);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (Date.now() < exp * 1000) {
          navigate('/admin');
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('adminToken');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!credential || !password) {
      setMessage('Please enter both credential and password.');
      setMessageType('error');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: credential, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        if (remember) localStorage.setItem('adminRemember', '1');
        setMessage('Signed in — redirecting…');
        setMessageType('success');
        if (data.tempPasswordExpiresAt) {
          setTempPasswordExpiry(new Date(data.tempPasswordExpiresAt).getTime());
        }
      } else {
        setMessage(data.message || 'Invalid credentials');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error — try again');
      setMessageType('error');
    }
  };

  useEffect(() => {
    if (tempPasswordExpiry) {
      const check = () => {
        const now = Date.now();
        const left = tempPasswordExpiry - now;
        if (left <= 0) {
          setMessage('Your temporary password has expired. Please reset your password.');
          setMessageType('error');
          setTempPasswordExpiry(null);
        } else {
          const mins = Math.ceil(left / 60000);
          setMessage(`Temporary password expires in ${mins} minute(s)`);
          setMessageType('warning');
        }
      };
      check();
      const t = setInterval(check, 30000);
      return () => clearInterval(t);
    }
  }, [tempPasswordExpiry]);

  useEffect(() => {
    if (messageType === 'success') {
      const t = setTimeout(() => navigate('/admin'), 1400);
      return () => clearTimeout(t);
    }
  }, [messageType, navigate]);

  return (
    <Page>
      <Card>
        <Header>
          <LogoImg src={logo} alt="Exdollarium" />
          <div>
            <Title>Admin Login</Title>
            <Desc>Secure admin access — enter your credentials to continue.</Desc>
          </div>
        </Header>

        <Form onSubmit={handleSubmit} noValidate>
          <Field>
            <Label htmlFor="admin-cred">Email or Username</Label>
            <Input id="admin-cred" value={credential} onChange={(e) => setCredential(e.target.value)} placeholder="admin@example.com" />
          </Field>

          <Field>
            <Label htmlFor="admin-pass">Password</Label>
            <InputWrap>
              <Input id="admin-pass" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              <ToggleButton type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</ToggleButton>
            </InputWrap>
          </Field>

          <Row>
            <Remember>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </Remember>
            <a href="/admin/forgot-password" style={{ color: '#0ea5e9', fontSize: 13 }}>Forgot?</a>
          </Row>

          <Button type="submit">Sign in</Button>
        </Form>

        {message && (
          <Message style={{ background: messageType === 'error' ? '#fff1f2' : messageType === 'warning' ? '#fff7ed' : '#ecfdf5', color: messageType === 'error' ? '#9b1c1c' : messageType === 'warning' ? '#92400e' : '#065f46' }} role="status">
            {message}
          </Message>
        )}
      </Card>
    </Page>
  );
}
