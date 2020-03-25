import React, { useState, useEffect, useRef } from 'react'
import Table from './Table'
import MyDetailed from './MyDetailed'
// import { useStores } from '../hooks/use-stores'
import { useHistory } from 'react-router'
// import { useRouteMatch } from 'react-router'

const getColumnName = propName => {
  return getAllColumnNames()[propName]
}

const getAllColumnNames = () => {
  return {
    id: '#',
    type: 'Ресурс',
    name: 'Марка',
    price: 'Цена',
    desc: 'Описание',
    info: 'hidden' // hidden = dont dysplay this in component
  }
}

// console.log('decode64', decodeURIComponent(escape(window.atob(searchData64))));
const getSearchDataFromPath = (sToken, needDecode = true) => {
  const curPath = window.location.pathname
  let result = ''
  if (curPath !== '/search') {
    let searchData64, n
    n = curPath.indexOf(sToken)
    if (n !== -1) {
      searchData64 = curPath.substring(n + sToken.length)
      n = searchData64.indexOf(';')
      if (n !== -1) {
        searchData64 = searchData64.substring(0, n)
        if (needDecode)
          result = decodeURIComponent(escape(window.atob(searchData64)))
        else result = searchData64
      }
    }
  }

  return result
}

const MySearch = () => {
  const inputSearchData = useRef(null)
  const inputSearchType = useRef(null)
  const { push } = useHistory()
  //const { path } = useRouteMatch()
  //const { myStore } = useStores()

  const [state, _setState] = useState({
    error: null,
    isLoaded: false,
    items: [],
    itemsView: [],
    sortColumn: undefined, // Current sort column
    sortDirection: 1, // Sort direction 1/-1
    searchData: '',
    searchType: 'все',
    isDetailed: false, // is Detailed component active ?
    idDetailed: 0, // id = items.id
    numActiveRow: 0 // <- this pass to Table component
  })

  const actualStateRef = useRef(state)
  // in place of original `setState`
  const setState = x => {
    actualStateRef.current = x // keep updated
    _setState(x)
  }

  const {
    itemsView,
    sortColumn,
    sortDirection,
    searchData,
    searchType,
    isDetailed,
    idDetailed,
    numActiveRow
  } = state

  useEffect(() => {
    const { isLoaded, items, searchData, searchType } = state
    // console.log('useEffect path=', window.location.pathname)

    const newSearchData = getSearchDataFromPath('s:')
    // console.log('newSearchData', newSearchData, 'searchData', searchData)

    const newSearchType = getSearchDataFromPath('t:')
    // console.log('newSearchType', newSearchType, 'searchType', searchType)
    // console.log('isLoaded', isLoaded)

    let newNumActiveRow = getSearchDataFromPath('a:', false)

    if (newNumActiveRow !== '') {
      newNumActiveRow = parseInt(newNumActiveRow)
    } else newNumActiveRow = numActiveRow
    // console.log('useEffect^ isLoaded', isLoaded, 'numActiveRow', numActiveRow, 'newNumActiveRow', newNumActiveRow)

    if (!isLoaded)
      fetch('http://localhost:3000/tabledata.txt')
        .then(res => res.json())
        .then(
          result => {
            setState({
              ...actualStateRef.current,
              isLoaded: true,
              items: result.items,
              itemsView: filterItems(
                result.items,
                newSearchData,
                newSearchType
              ),
              searchData: newSearchData,
              searchType: newSearchType,
              numActiveRow: newNumActiveRow
            })
          },
          // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
          // чтобы не перехватывать исключения из ошибок в самих компонентах.
          error => {
            setState({
              ...actualStateRef.current,
              isLoaded: true,
              error
            })
          }
        )
    else {
      // Component loaded
      if (
        searchData !== newSearchData ||
        searchType !== newSearchType ||
        numActiveRow !== newNumActiveRow
      ) {
        //console.log('Search criteria/numActiveRow changed', 'isLoaded', isLoaded)
        // Search criteria changed
        setState({
          ...actualStateRef.current,
          itemsView: filterItems(items, newSearchData, newSearchType),
          searchData: newSearchData,
          searchType: newSearchType,
          numActiveRow: newNumActiveRow
        })
      }
    }
  })

  const changeFilter = event => {
    console.log('changeFilter')
    // setState({
    //   ...actualStateRef.current,
    //   searchData: event.target.value
    // });
  }

  const changeSearchType = event => {
    console.log('changeSearchType')
    // setState({
    //   ...actualStateRef.current,
    //   searchType: event.target.value
    // });
  }

  const searchClick = event => {
    const searchDataValue = inputSearchData.current.value
    const searchTypeValue = inputSearchType.current.value

    let searchURL = ''
    let searchData64 = searchDataValue.trim()
    if (searchData64 !== '') {
      searchData64 =
        's:' + window.btoa(unescape(encodeURIComponent(searchDataValue))) + ';'
      searchURL += searchData64
    }
    let searchType64 = searchTypeValue.trim()
    if (searchType64 !== '') {
      searchType64 =
        't:' + window.btoa(unescape(encodeURIComponent(searchTypeValue))) + ';'
      searchURL += searchType64
    }

    if (searchURL !== '') searchURL = '/' + searchURL

    // console.log('searchData64', searchData64);
    // console.log('decode64', decodeURIComponent(escape(window.atob(searchData64))));
    push('/search' + searchURL)
  }

  const searchClear = event => {
    // console.log('searchClear')
    inputSearchData.current.value = ''
    inputSearchType.current.value = 'все'
    push('/search')
  }

  const filterItems = (items, newSearchData, newSearchType) => {
    let filtered = items.filter(value => {
      if (newSearchData === '') return true
      // name price desc
      const newSearchDataLowerCase = newSearchData.toLowerCase()
      const n1 = value.name.toLowerCase().indexOf(newSearchDataLowerCase)
      const n2 = value.price.toLowerCase().indexOf(newSearchDataLowerCase)
      const n3 = value.desc.toLowerCase().indexOf(newSearchDataLowerCase)
      return n1 !== -1 || n2 !== -1 || n3 !== -1
    })
    filtered = filtered.filter(value => {
      if (newSearchType === '' || newSearchType === 'все') return true
      // type
      const n1 = value.type.indexOf(newSearchType)
      return n1 !== -1
    })
    return filtered
  }

  const changeSortOrder = event => {
    // console.log('changeSortOrder', event.target.className)
    // click on Column header
    let arg1
    let lenBeforeSpace = event.target.className.indexOf(' ') // Take first className='class1 class2 class3'
    // console.log('event.target.className=(',event.target.className,') lenBeforeSpace= ', lenBeforeSpace, 'this.myP.sortColumn = ', this.myP.sortColumn);
    if (-1 === lenBeforeSpace) arg1 = event.target.className
    else arg1 = event.target.className.slice(0, lenBeforeSpace)
    //console.log('arg1= ', arg1, 'this.myP.sortColumn = ', this.myP.sortColumn);

    let { itemsView: dataRows, sortColumn, sortDirection } = state

    if (arg1 === sortColumn) sortDirection = -sortDirection
    else sortDirection = 1

    // this.myP.sortDataRows(arg1)
    if (arg1 === undefined) {
      if (dataRows.length === 0) return // If no data do nothing !
      arg1 = Object.keys(dataRows[0])[0] // take first column name for sort
    }

    // console.log('arg1', arg1, 'sortDirection', sortDirection)

    dataRows.sort((a, b) => {
      let compared = 0
      if (a[arg1] > b[arg1]) compared = 1 * sortDirection
      else if (a[arg1] < b[arg1]) compared = -1 * sortDirection
      return compared
    })

    // this.updateDataRows()
    setState({
      ...actualStateRef.current,
      itemsView: dataRows,
      sortColumn: arg1,
      sortDirection: sortDirection
    })
  }

  const changeActiveRow = numActiveRow => {
    setState({
      ...actualStateRef.current,
      numActiveRow
    })
  }

  const changeDetailed = (idClicked, numActiveRow) => {
    // const {itemsView: _itemsView} = actualStateRef.current
    // console.log('changeDetailed _itemsView.length', _itemsView.length)
    if (isDetailed === false) {
      // Detailed component hidden

      //console.log('changeDetailed numActiveRow', numActiveRow)

      let routeURL = ''
      let searchData64 = numActiveRow.toString()
      if (searchData64 !== '0') {
        searchData64 = 'a:' + searchData64 + ';'
        routeURL += searchData64
      }

      if (routeURL !== '') routeURL = '/' + routeURL

      // console.log('searchData64', searchData64);
      // console.log('decode64', decodeURIComponent(escape(window.atob(searchData64))));
      let curPath = window.location.pathname
      const nA = curPath.indexOf('/a:')
      if (nA !== -1) curPath = curPath.slice(0, nA)

      push(curPath + routeURL)
      //console.log('push(curPath + routeURL) = ', curPath + routeURL);

      setState({
        ...actualStateRef.current,
        isDetailed: !isDetailed,
        idDetailed: idClicked,
        numActiveRow
      })
    } else {
      // Detailed component visible
      // numActiveRow - saved before and have actual value

      let curPath = window.location.pathname
      const nA = curPath.indexOf('/a:')
      if (nA !== -1) curPath = curPath.slice(0, nA)

      push(curPath)

      setState({
        ...actualStateRef.current,
        isDetailed: !isDetailed
        //idDetailed: idClicked,
        //numActiveRow
      })
    }
  }
  // {isDetailed &&
  if (!isDetailed)
    return (
      <div className='MySearch'>
        <div className='MySearchLeftPanel'>
          <div className='hSearch'>
            <label htmlFor='sExpression' id='lsExpression'>
              Поиск:
            </label>
            <input
              ref={inputSearchData}
              type='text'
              className='input-text'
              id='sExpression'
              defaultValue={searchData}
              onChange={changeFilter}
            />
          </div>
          <div className='hSearchType'>
            <label htmlFor='sType' id='lsType'>
              Ресурс:
            </label>
            <select
              ref={inputSearchType}
              id='sType'
              defaultValue={searchType}
              onChange={changeSearchType}
            >
              <option value='газ'>газ</option>
              <option value='нефть'>нефть</option>
              <option value='уголь'>уголь</option>
              <option value='все'>- все ресурсы -</option>
            </select>
          </div>
          <div className='hButtons'>
            <button className='bSearch' onClick={searchClick}>
              Поиск
            </button>
            <button className='bClear' onClick={searchClear}>
              Очистить
            </button>
          </div>
          <div className='hTextInfo'>
            <p>
              &nbsp;&nbsp;Данные таблицы получены с сервера с помощью fetch()
              обработаны .json()-ом;
              <br />
              &nbsp;&nbsp;Вы можете сортировать таблицу по любой колонке (второй
              клик изменит порядок сортировки);
              <br />
              &nbsp;&nbsp;Поиск введенной строки ведется по всем колонкам кроме
              [#] и [Ресурс]
              <br />
              &nbsp;&nbsp;Router ссылки отрабатывают корректно. Обновление
              страницы по ссылке - работает.
              <br />
              <span className='lKey'>F9</span>, <span className='lKey'>F4</span>
              , <span className='lKey'>Enter</span>, ↑, ↓ - работают
            </p>
          </div>
        </div>
        <div className='MySearchRightPanel'>
          <Table
            data={itemsView}
            skipEvents={false}
            changeSortOrder={changeSortOrder}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            getColumnName={getColumnName}
            changeDetailed={changeDetailed}
            numActiveRow={numActiveRow}
            changeActiveRow={changeActiveRow}
          />
        </div>
      </div>
    )
  if (isDetailed)
    return (
      <div className='MyDetailedF9'>
        <MyDetailed
          data={itemsView}
          idDetailed={idDetailed}
          changeDetailed={changeDetailed}
        />
      </div>
    )
}

export default MySearch
