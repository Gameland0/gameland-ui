import { validIntNumber, validNumber } from '../utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'
import styled from 'styled-components'

export interface BaseProps {
  children?: React.ReactNode
  className?: string
}
interface NumInputProps extends BaseProps {
  showMax?: boolean
  value: number | string
  error?: string
  onMaxClick?: () => void
  min?: number
  max?: number
  validInt?: boolean
  onChange: (val: number) => void
}

const NumInputBox = styled.div`
  position: relative;
  .max-button {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 1;
  }
`

export const NumInput: React.FC<NumInputProps> = ({
  className,
  error,
  max,
  min = 0,
  onChange,
  onMaxClick,
  showMax,
  validInt,
  value
}) => {
  const [_value, _setValue] = useState<number | string>('')
  const _onChange = useMemo(() => onChange, [onChange])
  const _onMax = useMemo(() => onMaxClick, [onMaxClick])
  const handleChange = useCallback(
    (e) => {
      // console.log(e.currentTarget.value, validNumber(e.currentTarget.value, 0));
      const val = e.currentTarget.value

      if (validInt) {
        if (validIntNumber(val)) {
          _setValue(val)
          _onChange(val)
        }
        return
      }

      if (validNumber(val, min)) {
        _setValue(val)
        _onChange(val)
      }
    },
    [_onChange, min, validInt]
  )

  const handleMaxClick = useCallback(() => {
    _onMax && _onMax()
    max && _setValue(max)
  }, [_onMax, max])

  useEffect(() => {
    _setValue(value)
  }, [value])

  return (
    <NumInputBox className={className}>
      {showMax && (
        <Button className="max-button" onClick={handleMaxClick} shape="round" type="primary">
          MAX
        </Button>
      )}
      <input autoComplete="off" className="num-input" onChange={handleChange} placeholder="0.0" value={_value} />
      {error && <p className="error">{error}</p>}
    </NumInputBox>
  )
}
