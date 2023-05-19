import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const URL = 'http://localhost:3333';

export const socket = io(URL);

const SocketContext = createContext({ foo: 'bar' })

export function SocketProvider() {
    const state = { foo: 'bar' };
    return (
        <SocketContext.Provider value={state}>

        </SocketContext.Provider>
    )
}