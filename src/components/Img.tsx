import React from 'react'
import styled from 'styled-components'
import defaultImg from '../assets/default.png'
import { BaseProps } from './NumInput'

interface ImgProps extends BaseProps {
  hideRadius?: boolean
  src?: string
  alt?: string
}

const ImgWrap = styled.div`
  width: 100%;
  height: 100%:
`
const ImgInner = styled.div<{ hideRadius?: boolean }>`
  width: 100%;
  height: 0px;
  padding-bottom: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    border-bottom-left-radius: ${(hideRadius): string => (hideRadius ? '0' : '1rem')};
    border-bottom-right-radius: ${(hideRadius): string => (hideRadius ? '0' : '1rem')};
    object-fit: contain;
  }
`

export const Img: React.FC<ImgProps> = ({ src }) => {
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  return (
    <ImgWrap>
      <ImgInner>
        <img src={src} alt="" onError={handleImgError} />
      </ImgInner>
    </ImgWrap>
  )
}
