import React, { useState, useEffect, useRef } from 'react'
import Table from './Table'
import MyDetailed from './MyDetailed'
// import { useStores } from '../hooks/use-stores'
import { useHistory } from 'react-router'
// import { useRouteMatch } from 'react-router'
import { IParentListener } from '../api/kbdBridge'
import { Select, Row, Col, Form, Input } from 'antd';
// import 'antd/lib/select/style/css'
// import 'antd/lib/row/style/css'
// import 'antd/lib/col/style/css'
// import 'antd/lib/form/style/css'
// import 'antd/lib/input/style/css'

const getColumnName = (propName:string):string => {
  return getAllColumnNames()[propName]
}

const getAllColumnNames = ():{[key:string]: string} => {
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
const getSearchDataFromPath = (sToken:string, needDecode:boolean = true):string => {
  const curPath:string = window.location.pathname
  let result:string = ''
  if (curPath !== '/search') {
    let searchData64:string, n:number
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

export type FuncChangeDetailed = (idClicked?:IMySearchState['idDetailed'], 
                               numActiveRow?:IMySearchState['numActiveRow']) => void

export interface IMySearchState {
  error: any,
  isLoaded: boolean,
  items: Array<any>,
  itemsView: Array<any>,
  sortColumn: string | undefined, // Current sort column
  sortDirection: number, // Sort direction 1/-1
  searchData: string,
  searchType: string,
  isDetailed: boolean, // is Detailed component active ?
  idDetailed: number,  // id = items.id
  numActiveRow: number|string // <- this pass to Table component 0/''
}

interface IMySearchParams {
  altSearchData: string,
  altSearchType: string
}

const MySearch = ():React.ReactElement => {
  const inputSearchData:any = useRef<HTMLElement>(null)
  const inputSearchType:any = useRef<HTMLElement>(null)
  const { push } = useHistory()
  //const { path } = useRouteMatch()
  //const { myStore } = useStores()
  const isSearchTypeSelectOpen:any = useRef<any>(false)   // variable For html <Select>
  const isSelectOpen:any = useRef<any>(false)             // final state of <Select> use it for check status

  const [stateSearchParams, _setStateSearchParams] = useState<IMySearchParams>({
    altSearchData: '',
    altSearchType: 'все'
  })

  const actualStateSearchParamsRef = useRef<IMySearchParams>(stateSearchParams)
  // in place of original `setState`
  const setStateSearchParams = (x:any) => {
    actualStateSearchParamsRef.current = x // keep updated
    _setStateSearchParams(x)
  }

  const [state, _setState] = useState<IMySearchState>({
    error: null,
    isLoaded: false,
    items: [],
    itemsView: [],
    sortColumn: undefined, // Current sort column
    sortDirection: 1, // Sort direction 1/-1
    searchData: '',
    searchType: 'все',
    isDetailed: false, // is Detailed component active ?
    idDetailed: 0,     // id = items.id
    numActiveRow: 0    // <- this pass to Table component
  })
  const {    
    altSearchData,
    altSearchType    
  } = stateSearchParams

  const actualStateRef = useRef<IMySearchState>(state)
  // in place of original `setState`
  const setState = (x:any) => {
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
    //console.log('useEffect path=', window.location.pathname, isLoaded)
    //console.log('isDetailed = ', isDetailed)

    const newSearchData:string = getSearchDataFromPath('s:')
    // console.log('newSearchData', newSearchData, 'searchData', searchData)

    const newSearchType:string = getSearchDataFromPath('t:')
    // console.log('newSearchType', newSearchType, 'searchType', searchType)
    // console.log('isLoaded', isLoaded)

    let newNumActiveRow:string|number = getSearchDataFromPath('a:', false)

    if (newNumActiveRow !== '') {
      newNumActiveRow = parseInt(newNumActiveRow)
    } else newNumActiveRow = numActiveRow
    // console.log('useEffect^ isLoaded', isLoaded, 'numActiveRow', numActiveRow, 'newNumActiveRow', newNumActiveRow)

    if (!isLoaded)
      fetch('http://localhost:3000/tabledata.txt')
        .then(res => res.json())
        .then(
          result => {
            //console.log('fetch data')
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
            setStateSearchParams({
              ...actualStateSearchParamsRef.current,
              altSearchData: newSearchData,
              altSearchType: newSearchType==='' ? 'все' : newSearchType
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
      //console.log('Component allready loaded')
      if (
        searchData !== newSearchData ||
        searchType !== newSearchType ||
        numActiveRow !== newNumActiveRow
      ) {
        console.log('Search criteria/numActiveRow changed', 'isLoaded', isLoaded)
        // Search criteria changed
        setState({
          ...actualStateRef.current,
          itemsView: filterItems(items, newSearchData, newSearchType),
          searchData: newSearchData,
          searchType: newSearchType,
          numActiveRow: newNumActiveRow
        })
        setStateSearchParams({
          ...actualStateSearchParamsRef.current,
          altSearchData: newSearchData,
          altSearchType: newSearchType==='' ? 'все' : newSearchType
        })
      }
    }
  })

  
  const searchClick = (event:any) => {
    const {altSearchData, altSearchType} = actualStateSearchParamsRef.current
    // console.log('altSearchData', altSearchData)
    // console.log('altSearchType', altSearchType)
    const searchDataValue:string = altSearchData
    const searchTypeValue:string = altSearchType
    //console.log('inputSearchType ::::::::: ',inputSearchType.current.props.defaultValue)  // .state,searchTypeValue)

    let searchURL:string = ''
    let searchData64:string = searchDataValue.trim()
    if (searchData64 !== '') {
      searchData64 =
        's:' + window.btoa(unescape(encodeURIComponent(searchDataValue))) + ';'
      searchURL += searchData64
    }
    let searchType64:string = searchTypeValue.trim()
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

  const searchClear = (event:any) => {
    // console.log('searchClear')    
    setStateSearchParams({
      ...actualStateSearchParamsRef.current,
      altSearchData: '',
      altSearchType: 'все'
    })
    push('/search')
  }

  const filterItems = (items:IMySearchState['items'], 
                       newSearchData:IMySearchState['searchData'], 
                       newSearchType:IMySearchState['searchType']) => {
    let filtered = items.filter(value => {
      if (newSearchData === '') return true
      // name price desc
      const newSearchDataLowerCase = newSearchData.toLowerCase()
      const n1:number = value.name.toLowerCase().indexOf(newSearchDataLowerCase)
      const n2:number = value.price.toLowerCase().indexOf(newSearchDataLowerCase)
      const n3:number = value.desc.toLowerCase().indexOf(newSearchDataLowerCase)
      return n1 !== -1 || n2 !== -1 || n3 !== -1
    })
    filtered = filtered.filter(value => {
      if (newSearchType === '' || newSearchType === 'все') return true
      // type
      const n1:number = value.type.indexOf(newSearchType)
      return n1 !== -1
    })
    return filtered
  }

  const changeSortOrder = (event:any) => {
    // console.log('changeSortOrder', event.target.className)
    // click on Column header
    let arg1:string
    let lenBeforeSpace:number = event.target.className.indexOf(' ') // Take first className='class1 class2 class3'
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

  // Not used more
  // const changeActiveRow = (numActiveRow:IMySearchState['numActiveRow']) => {
  //   setState({
  //     ...actualStateRef.current,
  //     numActiveRow
  //   })
  // }

  const changeDetailed:FuncChangeDetailed = (idClicked:IMySearchState['idDetailed'] | undefined, 
                                          numActiveRow:IMySearchState['numActiveRow'] | undefined):void => {
    // const {itemsView: _itemsView} = actualStateRef.current
    //console.log('changeDetailed isDetailed', isDetailed)
    if (isDetailed === false) {
      // Detailed component hidden

      //console.log('changeDetailed numActiveRow', numActiveRow)

      let routeURL:string = ''
      let searchData64:string = (numActiveRow === undefined ? '' : numActiveRow.toString())
      if (searchData64 !== '0') {
        searchData64 = 'a:' + searchData64 + ';'
        routeURL += searchData64
      }

      if (routeURL !== '') routeURL = '/' + routeURL

      // console.log('searchData64', searchData64);
      // console.log('decode64', decodeURIComponent(escape(window.atob(searchData64))));
      let curPath:string = window.location.pathname
      const nA:number = curPath.indexOf('/a:')
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
      const newIsDetailed:boolean = !isDetailed
      setState({
        ...actualStateRef.current,
        isDetailed: newIsDetailed
        //idDetailed: idClicked,
        //numActiveRow
      })

      // let curPath:string = window.location.pathname
      // const nA:number = curPath.indexOf('/a:')
      // if (nA !== -1) curPath = curPath.slice(0, nA)
      // push(curPath)
    }
  }

  const searchKbd = (event_keyCode:number):boolean => {
    let kbdEventStillActive:boolean = true

    if(event_keyCode === 38) {
      //console.log('searchKbd KeyUP !')
      //document.getElementById('sExpression')?.focus()
      kbdEventStillActive = false
    }

    if(event_keyCode === 39) {
      //console.log('searchKbd KeyRight !')
      document.getElementById('sExpression')?.blur()
      kbdEventStillActive = false
    }

    if(event_keyCode === 13 || event_keyCode === 40) {
      //console.log('searchKbd Enter / KeyDown !')
      document.getElementById('sType')?.focus()
      kbdEventStillActive = false
    }

    return kbdEventStillActive
  }

  const searchTypeKbd = (event_keyCode:number):boolean => {
    let kbdEventStillActive:boolean = true
   
    // const el:any = getFocusedElement()
    // console.log('el.id',el.id)
    //console.log('isSelectOpen ? ',isSelectOpen.current)
    if(!isSelectOpen.current) {
      if(event_keyCode === 38) {
        //console.log('searchTypeKbd KeyUP !')
        document.getElementById('sExpression')?.focus()
        kbdEventStillActive = false
      }

      if(event_keyCode === 40) {
        //console.log('searchTypeKbd KeyDown !')
        document.getElementById('bSearch')?.focus()
        kbdEventStillActive = false
      }

      if(event_keyCode === 13) {
        //console.log('searchClickKbd Enter !')      
        // document.getElementById('sType')?.toggle()
        kbdEventStillActive = false
      }
    }
    else {
      kbdEventStillActive = false
    }

    return kbdEventStillActive
  }
  
  const searchClickKbd = (event_keyCode:number):boolean => {
    let kbdEventStillActive:boolean = true

    if(event_keyCode === 38 || event_keyCode === 37) {
      //console.log('searchClickKbd KeyUP OR KeyLeft !')
      document.getElementById('sType')?.focus()
      kbdEventStillActive = false
    }

    if(event_keyCode === 40 || event_keyCode === 39) {
      //console.log('searchClickKbd KeyDown OR KeyRight!')
      document.getElementById('bClear')?.focus()
      kbdEventStillActive = false
    }

    if(event_keyCode === 13) {
      console.log('searchClickKbd Enter !')
      searchClick(null)
      kbdEventStillActive = false
    }

    return kbdEventStillActive
  }
  
  const searchClearKbd = (event_keyCode:number):boolean => {
    let kbdEventStillActive:boolean = true
    // console.log('searchClearKbd : ', event_keyCode)

    if(event_keyCode === 38 || event_keyCode === 37) {
      //console.log('searchClearKbd KeyUP OR KeyLeft !')
      document.getElementById('bSearch')?.focus()
      kbdEventStillActive = false
    }

    if(event_keyCode === 13) {
      //console.log('searchClearKbd Enter !')
      searchClear(null)
      kbdEventStillActive = false
    }
    
    if(event_keyCode === 40 || event_keyCode === 39) {
      // console.log('searchClearKbd KeyDown  OR KeyRight !')
      document.getElementById('bClear')?.blur()
      kbdEventStillActive = false
    }

    return kbdEventStillActive
  }

  const mySearchKbdListeners:IParentListener = {
    parentFocusedElementId: ['sExpression', 'sType', 'bSearch', 'bClear'],
    parentFocusedElementListener: [searchKbd, searchTypeKbd, searchClickKbd, searchClearKbd]
  }
  
  // handleFormSubmit = event => {
  //   event.preventDefault();
  //   const name = event.target.elements.name.value;
  //   const description = event.target.elements.description.value;
  //   const category = event.target.elements.category.value;
  //   console.log(name, description, this.refs.category.value);
  // };
  // console.log('Render: searchType',searchType)  
  const { Option } = Select;
  // ======================================== RETURN ===========================================
  if (!isDetailed)
    return (
      <div className='MySearch'>
        <div className='MySearchLeftPanel'>          
          <Form.Item style={{ marginTop: 8 }}>
          <Row>
              <Col className='lblField' style={{ marginLeft: 1, width: 50, textAlign: "left" }}>Поиск:</Col>
              <Col>
                <Input id='sExpression'
                  value={altSearchData}
                  style={{ marginLeft: 5, width: 150 }} size='small'
                  onChange={event => {                    
                    console.log('event.target.value', event.target.value)
                    setStateSearchParams({...actualStateSearchParamsRef.current, altSearchData: event.target.value})
                  }}
                >
                </Input>
              </Col>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <Col className='lblField' style={{ marginLeft: 1, width: 50, textAlign: "left" }}>Ресурс:</Col>
              <Col>
                <Select id='sType' ref={inputSearchType}
                  value={altSearchType}
                  style={{ marginLeft: 5, width: 150 }} size='small'
                  onChange={value => {
                    // console.log('Select onChange', value)
                    // inputSearchType.current.state = value
                    setStateSearchParams({...actualStateSearchParamsRef.current, altSearchType: value})
                  }}
                  onDropdownVisibleChange={open => {
                    // console.log('Select open', open)
                    isSearchTypeSelectOpen.current = open
                  }}
                  onInputKeyDown={event => {
                    // console.log('Select onInputKeyDown', event.keyCode, isSearchTypeSelectOpen.current)
                    //             KeyDown                  KeyUP
                    if(event.keyCode === 40 || event.keyCode === 38) {
                      isSelectOpen.current = isSearchTypeSelectOpen.current   // Save open_state before it changes after key-event
                    }
                  }}                  
                >
                  <Option value="газ">газ</Option>
                  <Option value="нефть">нефть</Option>
                  <Option value="уголь">уголь</Option>
                  <Option value="все">- все ресурсы -</Option>
                </Select>
              </Col>
            </Row>
          </Form.Item>
          <div className='hSearch'>            
          </div>
          <div className='hSearchType'>            
          </div>
          <div className='hButtons'>
            <button className='bSearch' id='bSearch' onClick={searchClick}>
              Поиск
            </button>
            <button className='bClear' id='bClear' onClick={searchClear}>
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
            parentKbdListeners={mySearchKbdListeners}
          />
        </div>
      </div>
    )
  else // (isDetailed)
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
