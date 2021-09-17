import React from 'react'
import styled from 'styled-components'
import defaultImg from '../assets/default.png'

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>

const ImgWrap = styled.div`
  width: 100%;
  height: 100%:
`
const ImgInner = styled.div`
  width: 100%;
  height: 0px;
  padding-bottom: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 1rem;
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
