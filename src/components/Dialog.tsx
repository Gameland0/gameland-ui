import React from 'react'
import { Modal as AModal, Modal } from 'antd'
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
  top: -3.5rem;
  &:after {
    content: '×';
    height: 2.5rem;
    line-height: 2.35rem;
    font-size: 1.5rem;
    display: block;
    font-weight: bold;
  }
`
const Title = styled.div`
  width: 700px;
  height: 4rem;
  line-height: 4rem;
  border-radius: 0.25rem;
  background: #f3f5f7;
  text-align: center;
  position: absolute;
  right: 0;
  top: -3rem;
  &:after {
    content: 'Prompt';
    height: 2.5rem;
    line-height: 4rem;
    font-size: 1.5rem;
    display: block;
    color: #333333;
    font-weight: bold;
  }
`
export const Dialog: React.FC<ModalProps> = ({ children, ...props }) => {
  return (
    <AModal
      width={700}
      closeIcon={<CloseBtn />}
      title={<Title />}
      bodyStyle={{ background: '#fff', color: '#404040', padding: '3rem' }}
      closable
      {...props}
    >
      {children}
    </AModal>
  )
}
