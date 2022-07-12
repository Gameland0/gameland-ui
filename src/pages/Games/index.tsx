import React, { useEffect, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Row, Col } from 'antd'
import search from '../../assets/search_bar_icon_search.svg'
import arrow from '../../assets/icon_select.svg'

const Sort = styled.div`
  height: 3.75rem;
  display: flex;
  background: #fff;
  justify-content: space-between;
  position: fixed;
  z-index: 20;
  margin-left: 1rem;

  @media screen and (min-width: 1152px) {
    width: 785px;
  }
  @media screen and (min-width: 1440px) {
    width: 968px;
  }
  @media screen and (min-width: 1920px) {
    width: 1188px;
  }
  .filter {
    width: 30.8%;
    height: 3.75rem;
    border-radius: 10px 10px 10px 10px;
    border: 2px solid #e5e5e5;
    position: absolute;
    right: 0;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    line-height: 3.75rem;
    padding-left: 2rem;
    cursor: pointer;
  }
  .sortSelect {
    width: 30.8%;
    height: 122px;
    background: #fff;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    border-radius: 10px 10px 10px 10px;
    padding: 0 2rem;
    position: absolute;
    top: 4.5rem;
    right: 0;
    z-index: 99;
    div {
      height: 61px;
      font-size: 18px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      font-weight: 400;
      color: #333333;
      line-height: 61px;
      cursor: pointer;
    }
  }
`
export const Games = () => {
  const [collection, setCollection] = useState('')
  const [filterMenu, setFilterMenu] = useState(false)
  const handleCollectionChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setCollection(val)
  }, [])
  return (
    <div className="container">
      <Row gutter={0}>
        <Col span="6">
          <div className="MenuBar">
            <div className="collection">
              <h2>Collection</h2>
              <div className="search">
                <span>
                  <img src={search} />
                </span>
                <input onChange={handleCollectionChange} value={collection} placeholder="search" />
              </div>
              {/* {collectionFilterResult && collectionFilterResult.length ? (
                <div className="result">
                  {collectionFilterResult.map((item: any, index: any) => (
                    <div key={index} onClick={() => collectionFilter(item.contractName)}>
                      {item.contractName}
                    </div>
                  ))}
                </div>
              ) : (
                ''
              )} */}
              {/* {showNotFound ? <div className="notFound">No items found</div> : ''} */}
            </div>
            <iframe src="https://www.baidu.com" height="400" name="baidu" scrolling="auto"></iframe>
          </div>
        </Col>
        <Col span="18">
          <Sort>
            <div className="filter" onClick={() => setFilterMenu(!filterMenu)}>
              Polygon
              <img src={arrow} className="arrowIcon" />
            </div>
            {filterMenu ? (
              <div className="sortSelect">
                <div className="border-bottom">Polygon</div>
                <div>BSC chain</div>
              </div>
            ) : (
              ''
            )}
          </Sort>
        </Col>
      </Row>
    </div>
  )
}
