import React from 'react'
import { Modal as AModal } from 'antd'
import { ModalProps } from 'antd'
// import styled from 'styled-components'

export const UserInfoDialog: React.FC<ModalProps> = ({ children, ...props }) => {
  return (
    <AModal width={738} bodyStyle={{ background: '#fff', color: '#404040', padding: '3rem' }} closable {...props}>
      {children}
    </AModal>
  )
}
