import React, { useEffect, useState } from 'react'
import styled from 'styled-components'


const ImgInner = styled.span`
  margin-right: 0.25rem;
  img {
    width: 0.9rem;
    height: 0.9rem;
    margin-bottom: 0.1rem;
  }
`

export const Icon = (type) => {
  const [img, setImg] = useState('')
  return (
    <ImgInner>
      <img src={img} alt="" />
    </ImgInner>
  )
}
