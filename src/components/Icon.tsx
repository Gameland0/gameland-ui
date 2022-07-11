import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../hooks'
import { BaseProps } from './NumInput'
import polygonIcon from '../assets/polygon_icon.svg'
import BNBIcon from '../assets/bnb.svg'
import BUSDIcon from '../assets/busd.svg'
import WETHIcon from '../assets/WETH.svg'
interface ImgProps extends BaseProps {
  type: string
}

const ImgInner = styled.span`
  margin-right: 0.25rem;
  img {
    width: 0.9rem;
    height: 0.9rem;
    margin-bottom: 0.1rem;
  }
`

export const Icon: React.FC<ImgProps> = (type) => {
  const { chainId } = useActiveWeb3React()
  const [img, setImg] = useState('')
  useEffect(() => {
    if (chainId === 56) {
      if (type.type === 'eth') {
        setImg(BNBIcon)
      } else {
        setImg(BUSDIcon)
      }
    } else if (chainId === 137) {
      if (type.type === 'eth') {
        setImg(polygonIcon)
      } else {
        setImg(WETHIcon)
      }
    }
  }, [chainId, type])
  return (
    <ImgInner>
      <img src={img} alt="" />
    </ImgInner>
  )
}
