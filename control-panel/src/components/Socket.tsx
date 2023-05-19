import React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { socket } from '../services/socket';

export default function Socket() {
  const send = () => {
    socket.send('hello');
    console.log('hello');
  }
  
  return (
    <Container>
      <Button onClick={send}>Push Me!</Button>
    </Container>
  )
}