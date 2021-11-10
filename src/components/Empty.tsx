import React from 'react'
import styled from 'styled-components'
import { Empty as AEmpty } from 'antd'

interface EmptyProps {
  text: string
}
const EmptyWrap = styled.div`
  width: 100%;
  .text {
    opacity: 0.5;
    margin-top: 1rem;
  }
`
export const Empty: React.FC<EmptyProps> = ({ text }) => {
  return (
    <EmptyWrap className={'flex flex-center flex-column'}>
      <AEmpty description={text} />
    </EmptyWrap>
  )
}
