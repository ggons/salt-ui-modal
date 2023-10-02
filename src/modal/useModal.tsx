import React from 'react';
import { ModalContext } from './ModalContext';

export default function useModal() {
  return React.useContext(ModalContext);
}
