import React from 'react'
import { Empty as AEmpty } from 'antd'

export const Empty = ({ text }) => {
  return (
    <div className={'EmptyWrap flex flex-center flex-column'}>
      <AEmpty image={AEmpty.PRESENTED_IMAGE_SIMPLE} description={text} />
    </div>
  )
}
