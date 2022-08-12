import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'
import styled from 'styled-components'

const NumInputBox = styled.div`
  position: relative;
  .max-button {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 1;
  }
`

export const NumInput = ({
  className,
  error,
  min = 0,
  onChange,
  validInt,
  value
}) => {
  const [_value, _setValue] = useState('')
  const _onChange = useMemo(() => onChange, [onChange])
  const handleChange = useCallback(
    (e) => {
      const val = e.currentTarget.value
        _setValue(val)
        _onChange(val)
    },
    [_onChange, min, validInt]
  )
  useEffect(() => {
    _setValue(value)
  }, [value])

  return (
    <NumInputBox className={className}>
      <input autoComplete="off" className="num-input" onChange={handleChange} placeholder="0.0" value={_value} />
      {error && <p className="error">{error}</p>}
    </NumInputBox>
  )
}
