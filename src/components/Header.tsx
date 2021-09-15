import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AccountBar } from './AccountBar'

const HeaderBox = styled.div`
  height: 100px;
  background: linear-gradient(180deg, #292929 0%, #585858 100%);
  overflow: hidden;
`

const activeClassName = 'ACTIVE'

const Link = styled(NavLink).attrs({
  activeClassName
})`
  display: block;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  line-height: 100px;
  height: 100px;
  margin: 0 1rem;
  padding: 0 1rem;

  &.${activeClassName} {
    position: relative;
    border-radius: 12px;
    font-weight: bold;
    border-radius: 0;
    background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
    span {
      transform: rotate(-15deg);
    }
    &:before {
      content: '';
      width: 17px;
      height: 105px;
      position: absolute;
      left: -10px;
      transform: rotate(8deg);
      background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
    }
    &:after {
      content: '';
      width: 17px;
      height: 105px;
      position: absolute;
      right: -10px;
      top: -2px;
      transform: rotate(8deg);
      background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
    }
  }

  :hover,
  :focus {
    color: white;
  }
`
export const Header = () => {
  return (
    <HeaderBox>
      <div className="container flex flex-h-between flex-v-center">
        <div className="logo">GameLand</div>
        <div className="flex flex-h-between">
          <Link exact to="/">
            <span>Rent</span>
          </Link>
          <Link to="/lend">
            <span>Lend</span>
          </Link>
          <Link to="/dashboard">
            <span>Dashboard</span>
          </Link>
        </div>
        <div className="flex flex-h-between flex-v-center">
          <AccountBar key="accountbar" />
        </div>
      </div>
    </HeaderBox>
  )
}
