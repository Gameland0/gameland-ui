import React from 'react'
import styled from 'styled-components'
import { Img } from './Img'

interface NftViewProps {
  img?: string
  name?: string
}
const NftViewBox = styled.div`
  width: 18rem;
  height: 18rem;
`
export const NftView: React.FC<NftViewProps> = ({ img, name }) => {
  return (
    <NftViewBox>
      <Img src={img} alt={name} />
    </NftViewBox>
  )
}
