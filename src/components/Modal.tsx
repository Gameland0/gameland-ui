import React from 'react'
import { Modal as AModal } from 'antd'
import { ModalProps } from 'antd'
import styled from 'styled-components'

const CloseBtn = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  border-radius: 0.25rem;
  background: #d3d5d7;
  text-align: center;
  position: absolute;
  right: -0.5rem;
  top: -0.5rem;
  &:after {
    content: '×';
    height: 2.5rem;
    line-height: 2.35rem;
    font-size: 1.5rem;
    display: block;
    font-weight: bold;
  }
`

export const Modal: React.FC<ModalProps> = ({ children, ...props }) => {
  return (
    <AModal
      width={700}
      closeIcon={<CloseBtn />}
      bodyStyle={{ background: '#f3f5f7', color: '#404040', padding: '3rem' }}
      closable
      {...props}
    >
      {children}
    </AModal>
  )
}
