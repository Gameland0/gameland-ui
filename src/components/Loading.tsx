import React from 'react'
import styled from 'styled-components'
import { ReactComponent as LoadingIcon } from '../assets/loading.svg'
const LoadingBox = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 100;
`
export const Loading = () => {
  return (
    <LoadingBox className="flex flex-center">
      <LoadingIcon />
    </LoadingBox>
  )
}
