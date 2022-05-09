import React from 'react'
import styled from 'styled-components'
import defaultImg from '../assets/polygon_icon.svg'
import { BaseProps } from './NumInput'

interface ImgProps extends BaseProps {
  hideRadius?: boolean
  src?: string
  alt?: string
  size?: number
}

const ImgInner = styled.span`
  margin-right: 0.25rem;
  img {
    width: 0.8rem;
    height: 0.8rem;
    margin-bottom: 0.1rem;
  }
`

export const Icon: React.FC<ImgProps> = () => {
  return (
    <ImgInner>
      <img src={defaultImg} alt="" />
    </ImgInner>
  )
}
