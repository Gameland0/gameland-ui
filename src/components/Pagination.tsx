import React from 'react'
import styled from 'styled-components'
import { FakeButton } from './RentCard'

interface PaginationProps {
  onNext: () => void
  onPrev: () => void
  nextDisabled: boolean
  prevDisabled: boolean
  align: 'left' | 'center' | 'right'
}

const Button = styled(FakeButton)`
  margin: 0 0.5rem;
`

const PaginationBox = styled.div<{
  align: 'left' | 'center' | 'right'
}>`
  padding: 1rem 0;
  display: flex;
  justify-content: ${({ align }) => (align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end')};
`

export const Pagination: React.FC<PaginationProps> = ({ align, onNext, onPrev, nextDisabled, prevDisabled }) => {
  const handlePrev = () => {
    if (prevDisabled) return
    onPrev && onPrev()
  }
  const handleNext = () => {
    if (nextDisabled) return
    onNext && onNext()
  }
  return (
    <PaginationBox align={align}>
      <Button disabled={prevDisabled} onClick={handlePrev}>
        Prev
      </Button>
      <Button disabled={nextDisabled} onClick={handleNext}>
        Next
      </Button>
    </PaginationBox>
  )
}
