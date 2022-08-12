import React, { useMemo } from 'react'
import styled from 'styled-components'

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
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    object-fit: contain;
  }
`

export const Img = ({ src }) => {
  const handleImgError = (e) => {
    e.target.src = 'assets/default.png'
  }
  const _img = useMemo(() => {
    if (src?.includes('googleusercontent')) return src

    if (src?.startsWith('http')) return src

    if (src?.startsWith('ipfs')) {
      return 'https://nftstorage.link/ipfs/' + src.substring(7)
    }
    return src
  }, [src])
  return (
    <ImgWrap>
      <ImgInner>
        <img src={_img} alt="" onError={handleImgError} />
      </ImgInner>
    </ImgWrap>
  )
}
