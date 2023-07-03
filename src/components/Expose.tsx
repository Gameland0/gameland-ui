import styled from 'styled-components'
import React, { useEffect, useState, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { bschttp } from './Store'
import { dateConvert } from './CollectionDetails'
import { useActiveWeb3React, useStore } from '../hooks'
import defaultImg from '../assets/default.png'
import search from '../assets/search_bar_icon_search.svg'
import arrow from '../assets/icon_select.svg'
import Mirror from '../assets/mirror.jpeg'
import Gameland from '../assets/icon_gameland.svg'

export const ExposeBox = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  margin-top: 72px;
  min-height: 400px;
  .noArticle {
    font-size: 24px;
    font-weight: bold;
  }
`
export const ArticleBox = styled.div`
  border-bottom: 1px solid #e5e5e5;
  color: #333333;
  margin-bottom: 48px;
  .information {
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .userName {
      margin: 0 16px;
      font-size: 24px;
    }
    .time {
      font-size: 24px;
      color: #999999;
    }
  }
  .title {
    font-size: 44px;
    font-weight: bold;
    margin: 24px 0;
  }
  .context {
    font-size: 16px;
    -webkit-line-clamp: 5;
  }
  .frequency {
    font-size: 18px;
    color: #d0d0d0;
    margin: 24px 0;
  }
`
const Sort = styled.div`
  position: relative;
  width: 991px;
  height: 82px;
  margin: auto;
  background: #fff;
  box-shadow: 0px 0px 20px 1px rgba(53, 202, 169, 0.15);
  border-radius: 10px;
  border: 2px solid #f5f5f5;
  margin-bottom: 36px;
  padding: 0 2rem;
  z-index: 30;
  .searchBox {
    width: 100%;
    height: 100%;
    input {
      width: 80%;
      height: 100%;
      border: 1px solid var(--border-color);
      outline: none;
      font-size: 18px;
      background: none;
      line-height: 40px;
      margin-left: 10px;
    }
    .articleType {
      width: 130px;
      height: 30px;
      border: 1px solid #d5d5d5;
      margin-right: 8px;
      border-radius: 10px;
      padding: 0 8px;
      img {
        width: 14px;
        height: 14px;
      }
    }
    .articleTypeFilter {
      width: 130px;
      position: absolute;
      top: 58px;
      box-shadow: 0px 0px 10px 1px rgb(0 0 0 / 16%);
      background: #fff;
      border-radius: 10px;
      padding: 8px;
      div {
        width: 100%;
        margin-bottom: 8px;
        &:hover {
          background: #41acef;
        }
      }
      img {
        width: 20px;
        height: 20px;
        border-radius: 10px;
        margin-right: 5px;
      }
    }
  }
  .result {
    width: 100%;
    min-height: 200px;
    overflow: auto;
    background: #fff;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    border-radius: 10px;
    margin-top: 8px;
    padding: 12px;
    div {
      height: 1.5rem;
      font-size: 16px;
      color: #333333;
      margin-bottom: 1rem;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .notFound {
    height: 3.75rem;
    background: #fff;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    border-radius: 10px;
    margin-top: 8px;
    font-weight: 500;
    font-size: 16px;
    color: rgb(112, 122, 131);
    line-height: 3.75rem;
    padding-left: 24px;
  }
`
const SeeMore = styled.div`
  width: 120px;
  height: 40px;
  border: 1px solid #35caa9;
  border-radius: 10px;
  color: #35caa9;
  cursor: pointer;
  margin: auto;
`
export const Expose = () => {
  const { account } = useActiveWeb3React()
  const { userinfo } = useStore()
  const [mirrorPage, setMirrorPage] = useState(1)
  const [searchContent, setSearchContent] = useState('')
  const [articleType, setArticleType] = useState('All')
  const [showNotFound, setShowNotFound] = useState(false)
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [refreshBy, setrefreshBy] = useState(false)
  const [ArticleAll, setArticleAll] = useState([] as any)
  const [ArticleData, setArticleData] = useState([] as any)
  // const [userInfo, setUserInfo] = useState([] as any)
  const [articleSearchResult, setArticleSearchResult] = useState([] as any)
  const history = useHistory()
  const getData = async () => {
    // const userdata = await bschttp.get(`v0/userinfo`)
    // setUserInfo(userdata.data.data)
    const param = {
      page: 1,
      pagesize: 8
    }
    const mirrorData = (await bschttp.post('v0/mirrow_article/paging', param)).data.data.filter((item: any) => {
      return item.is_use === 1
    })
    const postsdata = (await bschttp.post(`v0/posts/paging`, param)).data.data.filter((item: any) => {
      return item.is_use === 1
    })
    const arr = [...mirrorData, ...postsdata].sort(() => {
      return Math.random() - 0.5
    })
    setArticleAll(arr)
    setArticleData(arr)
  }
  useEffect(() => {
    getData()
  }, [account, refreshBy])
  useEffect(() => {
    searchArticle()
  }, [searchContent])
  useEffect(() => {
    if (articleType === 'All') {
      setArticleAll(ArticleData)
    } else if (articleType === 'Gameland') {
      const filter = ArticleData.filter((item: any) => {
        return item.type === 'Gameland'
      })
      setArticleAll(filter)
    } else {
      const filter = ArticleData.filter((item: any) => {
        return item.type !== 'Gameland'
      })
      setArticleAll(filter)
    }
  }, [articleType])
  const searchArticle = () => {
    const arr: any[] = []
    ArticleAll.map((item: any) => {
      if (item.title.indexOf(searchContent) !== -1 && searchContent !== '') {
        arr.push(item)
      } else {
        setArticleSearchResult([])
        setrefreshBy(!refreshBy)
      }
    })
    if (arr.length) {
      const res = new Map()
      const newArr = arr.filter((item: any) => {
        return !res.has(item.contractName) && res.set(item.contractName, 1)
      })
      setArticleSearchResult(newArr)
      setShowNotFound(false)
    } else {
      setShowNotFound(true)
    }
    if (searchContent === '') {
      setShowNotFound(false)
      setArticleSearchResult([])
    }
    if (ArticleAll.length == 0) {
      if (searchContent) {
        setShowNotFound(true)
      }
    }
  }
  const filterUserData = (item: any) => {
    if (item.type === 'Mirror') {
      return userinfo.filter((ele: any) => {
        return ele.useraddress.toLowerCase() === item.owner.toLowerCase()
      })
    } else if (item.type === 'Gameland') {
      return userinfo.filter((ele: any) => {
        return ele.useraddress.toLowerCase() === item.useraddress.toLowerCase()
      })
    } else {
      return userinfo.filter((ele: any) => {
        return ele.useraddress.toLowerCase() === item.owner.toLowerCase()
      })
    }
  }
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  const ItemClick = async (item: any) => {
    history.push({
      pathname: `/Article/${item.type || 'Mirror'}/${item.owner || item.useraddress}/${item.id}`
    })
    if (item.owner?.toLowerCase() === account?.toLowerCase()) return
    const params = {
      view: item.view + 1
    }
    if (item.type === 'Mirror') {
      bschttp.put(`/v0/mirrow_article/${item.id}`, params)
    } else if (item.type === 'Gameland') {
      bschttp.put(`/v0/posts/${item.id}`, params)
    } else {
      bschttp.put(`/v0/mirrow_article/${item.id}`, params)
    }
  }
  const seeMore = async () => {
    const param = {
      page: mirrorPage + 1,
      pagesize: 8
    }
    const mirrorData = (await bschttp.post('v0/mirrow_article/paging', param)).data.data.filter((item: any) => {
      return item.is_use === 1
    })
    const postsdata = (await bschttp.post(`v0/posts/paging`, param)).data.data.filter((item: any) => {
      return item.is_use === 1
    })
    const arr = [...mirrorData, ...postsdata].sort(() => {
      return Math.random() - 0.5
    })
    setArticleAll([...ArticleAll, ...arr])
    setMirrorPage(mirrorPage + 1)
  }
  const articleFilter = (title: string) => {
    const article = ArticleAll.filter((item: any) => {
      return item.title === title
    })
    setArticleAll(article)
    setArticleSearchResult([])
  }
  const filterType = (type: string) => {
    setArticleType(type)
    setShowTypeFilter(false)
  }
  const handleSearchChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setSearchContent(val)
  }, [])

  return (
    <div className="container">
      <ExposeBox>
        <Sort className="">
          <div className="flex flex-v-center searchBox">
            <div
              className="articleType flex flex-v-center flex-column-between cursor"
              onClick={() => setShowTypeFilter(!showTypeFilter)}
            >
              <div>{articleType}</div>
              <img src={arrow} />
            </div>
            {showTypeFilter ? (
              <div className="articleTypeFilter">
                <div className="flex flex-v-center cursor" onClick={() => filterType('Gameland')}>
                  <img src={Gameland} />
                  Gameland
                </div>
                <div className="flex flex-v-center cursor" onClick={() => filterType('Mirror')}>
                  <img src={Mirror} />
                  Mirror
                </div>
                <div onClick={() => filterType('All')}>All</div>
              </div>
            ) : (
              ''
            )}
            <img src={search} />
            <input onChange={handleSearchChange} value={searchContent} placeholder="search" />
          </div>
          {articleSearchResult && articleSearchResult.length ? (
            <div className="result">
              {articleSearchResult.map((item: any, index: any) => (
                <div className="cursor" key={index} onClick={() => articleFilter(item.title)}>
                  {item.title}
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
          {showNotFound ? <div className="notFound">No items found</div> : ''}
        </Sort>
        {ArticleAll && ArticleAll.length
          ? ArticleAll.map((item: any, index: any) => (
              <ArticleBox key={index} onClick={() => ItemClick(item)} className="cursor">
                <div className="information flex flex-v-center">
                  <img src={filterUserData(item)[0]?.image} onError={handleImgError} />
                  <div className="userName">{filterUserData(item)[0]?.username}</div>
                  <div className="time">· {item.datetime || dateConvert(item.createdAt)}</div>
                </div>
                <div className="title">{item.title}</div>
                <div className="context line-clamp">{item.context_text}</div>
                <div className="frequency">
                  {item.view || 0} view · from {item.type || 'Mirror'}
                </div>
              </ArticleBox>
            ))
          : ''}
        {ArticleAll && ArticleAll.length > 1 ? (
          <SeeMore className="flex flex-center" onClick={seeMore}>
            See More
          </SeeMore>
        ) : (
          ''
        )}
      </ExposeBox>
    </div>
  )
}
