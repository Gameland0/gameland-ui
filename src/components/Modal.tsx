import React from 'react'
import { Modal as AModal } from 'antd'
import { ModalProps } from 'antd'

export const Modal: React.FC<ModalProps> = ({ children, ...props }) => {
  return (
    <AModal width={700} bodyStyle={{ background: '#3e3e3e', color: 'white', padding: '3rem' }} closable {...props}>
      {children}
    </AModal>
  )
}
