import React from 'react'
import styled from 'styled-components'
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
      <img src="assets/loading.svg" />
    </LoadingBox>
  )
}
