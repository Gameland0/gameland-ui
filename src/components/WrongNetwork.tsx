import React from 'react'
import { Button } from 'antd'
import { ToastContainer, toast } from 'react-toastify'
import { ButtonProps } from 'antd/lib/button/button'

export const WrongNetwork: React.FC<ButtonProps> = ({ ...props }) => {
  const notify = () => toast('please switch to supported network!')
  return (
    <div>
      <Button {...props} onClick={notify}>
        Wrong Network
      </Button>
      <ToastContainer theme="dark" />
    </div>
  )
}
