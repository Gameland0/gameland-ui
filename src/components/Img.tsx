import React, { useMemo } from 'react'
import styled from 'styled-components'
import defaultImg from '../assets/default.png'
import { BaseProps } from './NumInput'

interface ImgProps extends BaseProps {
  hideRadius?: boolean
  src?: string
  alt?: string
  size?: number
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

export const Img: React.FC<ImgProps> = ({ src, size }) => {
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  const _img = useMemo(() => {
    if (src?.includes('googleusercontent')) return src + `=w${size}`

    if (src?.startsWith('http')) return src

    if (src?.startsWith('ipfs')) {
      return 'https://nftstorage.link/ipfs/' + src.substring(7)
    }

    return src
  }, [src, size])
  return (
    <ImgWrap>
      <ImgInner>
        <img src={_img} alt="" onError={handleImgError} />
      </ImgInner>
    </ImgWrap>
  )
}
