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

export const IpfsImg: React.FC<ImgProps> = ({ src, size }) => {
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  const _img = useMemo(() => {
    if (src?.includes('googleusercontent')) return src

    if (src?.startsWith('http')) return src

    if (src?.startsWith('ipfs')) {
      return 'https://nftstorage.link/ipfs/' + src.substring(7)
    }

    return src
  }, [src, size])
  return <img src={_img} alt="" onError={handleImgError} />
}
