import React from 'react'
import defaultImg from '../assets/default.png'
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>
export const Img: React.FC<ImgProps> = ({ src }) => {
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  return <img src={src} alt="" onError={handleImgError} />
}
