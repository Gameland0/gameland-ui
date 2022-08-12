import React, { useEffect, useState } from 'react'

//bodyStyle={{ background: '#f8f8f8', color: '#404040', padding: '4rem' }}
export const Modal = ({ children, callback, ...props }) => {
  const propsStatu = {...props}
  // console.log(propsStatu)
  const [visible, setVisible] = useState(propsStatu.visible)
  useEffect(() => {
    setVisible(propsStatu.visible)
  }, [propsStatu.visible])
    
  const closes = () => {
    // setVisible(false)
    // callback(() => {
    //   return false
    // })
  }
  if (visible) {
    return (
      <div className="mask" onClick={closes}>
        <div className="contentBox">
          {children}
        </div>
      </div>
    )
  }else{
    return ''
  }
}
