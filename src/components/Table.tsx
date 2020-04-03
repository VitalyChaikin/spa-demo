import React, { useState, useEffect, useRef } from 'react'
// import { useStores } from '../hooks/use-stores'
import { IMySearchState, FuncChangeDetailed } from './MySearch'
import { IParentListener, isKbdEventActive, setFocusOn1st, isParentListenerFocused } from '../api/kbdBridge'

interface IRowHeadProps {
  data: IMySearchState['itemsView'],
  skipEvents: boolean,
  changeSortOrder?: any,
  sortColumn?: IMySearchState['sortColumn'],
  sortDirection?: IMySearchState['sortDirection'],
  getColumnName: any
}

const RowHead = ({
  data: arr,
  skipEvents,
  changeSortOrder,
  sortColumn: p_sortColumn,
  sortDirection: p_sortDirection,
  getColumnName: p_getColumnName}:IRowHeadProps):React.ReactElement => {
  // const { myStore } = useStores()
  // let p = myStore.myP

  //console.log('skipEvents',skipEvents);
  let sorted: IMySearchState['sortColumn']
  let thList: Array<any> = []
  if (arr.length === 0) thList.push(<th key='noitems'>Нет данных</th>)
  else {
    let onClickEvent:any = undefined
    if (!skipEvents) onClickEvent = changeSortOrder
    // Use keys of first element for Column names
    Object.keys(arr[0]).forEach((element, key) => {
      sorted = undefined
      if (!skipEvents)
        if (element === p_sortColumn) {
          // dont decorate sorted column if skipEvent = true
          sorted = 'sortColumn' + (p_sortDirection === undefined ? '' : p_sortDirection.toString())
          //console.log('RowHead #1 sorted = ', sorted);
        }
      // console.log('RowHead #1 element = ', element);
      //console.log('RowHead #2 key = ', key);
      let columnName = p_getColumnName(element)
      // console.log('RowHead #1 element', element, 'columnName', columnName);
      if (!(columnName === 'hidden')) {
        thList.push(
          <th
            key={element}
            className={element}
            id={sorted}
            onClick={onClickEvent}
          >
            {columnName}
          </th>
        )
        // console.log('push className=', element, 'columnName=',columnName);
      } //else console.log('RowHead #1 skip element=', element, 'columnName=',columnName);
    })
  }
  return <tr>{thList}</tr>
}


interface IRowProps {
  data: IMySearchState['itemsView'],
  skipEvents: boolean,
  getColumnName: any,
  clickOnDataRow?: any,
  dblClickOnDataRow?: any,
  row: number,
  numActiveRow:IMySearchState['numActiveRow']
}

const Row = ({
  data: line,
  skipEvents,
  getColumnName: p_getColumnName,
  clickOnDataRow,
  dblClickOnDataRow,
  row,
  numActiveRow}:IRowProps):React.ReactElement => {
  // const { myStore } = useStores()
  // let p = myStore.myP

  let id:string | undefined = undefined
  let trColumns:Array<any> = []
  for (const property in line) {
    let columnName = p_getColumnName(property)
    // console.log('property', property, 'columnName', columnName, !(columnName==='hidden'));
    if (!(columnName === 'hidden')) {
      let className = 'td' + property // set className = 'tdname' for css selector
      let element = line[property]
      if (className === 'tdid') id = element
      //if (className === 'tdtype1' || className === 'tdtype2')
      //  className += element // tdtype1/tdtype2 also have value like: tdtype1fire
      trColumns.push(
        <td className={className} key={property} data-tag={id} data-row={row}>
          {element}
        </td>
      )
      //console.log('Row#1 push className=', className, 'element=',element);
    } //else console.log('Row #1 skip property=', property, 'columnName=',columnName);
  }
  if (id === undefined) id = ''
  let onClickEvent = undefined
  if (!skipEvents) onClickEvent = clickOnDataRow

  let trClassName = 'DataRow'
  if (row === numActiveRow) trClassName += '0'

  let trRow:any = []
  trRow.push(
    <tr
      className={trClassName}
      key={id}
      onClick={onClickEvent}
      onDoubleClick={dblClickOnDataRow}
    >
      {trColumns}
    </tr>
  )
  return trRow
}

interface IModalInfoProps {
  arrData: IMySearchState['itemsView'],
  isModalInfo: boolean,
  idClicked:IMySearchState['idDetailed'],
  closeModalInfo: any,
  getColumnName: any
}

const ModalInfo = (Props: IModalInfoProps) => {
  const {
    arrData,
    isModalInfo,
    idClicked,
    closeModalInfo,
    getColumnName
  } = Props

  // const { myStore } = useStores()
  let divModalInfo = null

  if (isModalInfo) {
    // console.log('ModalInfo: idClicked', idClicked, typeof idClicked);
    // console.log('ModalInfo: arrData', arrData, typeof arrData);

    const arrDataModal = arrData.filter(({ id }) => {
      //   console.log('id',id,typeof id);
      return id === idClicked
    })
    //console.log('this.choosenArrData',this.choosenArrData);
    // console.log('ModalInfo: arrDataModal', arrDataModal)
    const info = arrDataModal[0].info
    divModalInfo = (
      <div id='myModal' className='modal'>
        <div className='modal-content'>
          <button className='close' onClick={closeModalInfo}>
            &times;
          </button>
          <p>{info}</p>
          <table className='DataTable'>
            <thead>
              <RowHead
                data={arrDataModal}
                skipEvents={true}
                getColumnName={getColumnName}
              />
            </thead>
            <tbody>
              <Row
                key={0}
                data={arrDataModal[0]}
                skipEvents={true}
                getColumnName={getColumnName}                
                row={0}
                numActiveRow={-1}                
              />
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return divModalInfo
}

interface ITableState {
  isModalInfo: boolean,
  idClicked:IMySearchState['idDetailed'],
  numActiveRow:IMySearchState['numActiveRow']
  maxActiveRow: number,
  idActiveRow: IMySearchState['idDetailed']  
}

interface ITableProps {
  data: IMySearchState['itemsView'],
  changeSortOrder: any,
  skipEvents: boolean,
  sortColumn: IMySearchState['sortColumn'],
  sortDirection: IMySearchState['sortDirection'],
  getColumnName: any,
  changeDetailed?: FuncChangeDetailed,
  numActiveRow?:IMySearchState['numActiveRow'],
  parentKbdListeners?:IParentListener
}

const Table = (Props:ITableProps):React.ReactElement => {
  //const { myStore } = useStores()
  const arrData = Props.data
  const changeSortOrder = Props.changeSortOrder // Callback for changeSortOrder
  const skipEvents = Props.skipEvents
  const sortColumn = Props.sortColumn
  const sortDirection = Props.sortDirection
  const getColumnName = Props.getColumnName
  const changeDetailed = Props.changeDetailed
  const setActiveRow = Props.numActiveRow
  const parentKbdListeners = Props.parentKbdListeners
  // const changeActiveRow = Props.changeActiveRow // <-- Передается но не используется

  // console.log('Table::setActiveRow', setActiveRow)
  // const clickOnDataRow = Props.clickOnDataRow     // Callback for clickOnDataRow

  //console.log('Table props:parentKbdListeners',Props.parentKbdListeners);

  const [state, _setState] = useState<ITableState>({
    isModalInfo: false,
    idClicked: -1,
    numActiveRow: setActiveRow === undefined ? -1: setActiveRow,
    maxActiveRow: arrData.length,
    idActiveRow: -1
  })

  // define a ref, for use inside event Listener !
  const actualStateRef:any = useRef<ITableState>(state)

  // in place of original `setState`
  const setState = (x:any) => {
    actualStateRef.current = x // keep updated
    _setState(x)
  }

  const {    
    isModalInfo,
    idClicked,
    numActiveRow,
    maxActiveRow,
    idActiveRow
  } = actualStateRef.current

  if (maxActiveRow !== arrData.length) {
    // || numActiveRow !== setActiveRow)
    //console.log('Table: setActiveRow', setActiveRow)
    setState({
      ...actualStateRef.current,
      maxActiveRow: arrData.length,
      numActiveRow: setActiveRow
    })
  }
  const UpdateIdActiveRow = (numActiveRow:IMySearchState['numActiveRow'], idActiveRow:number | null) => {
    let newIdActiveRow = null
    arrData.forEach((item, index) => {
      if (numActiveRow === index) newIdActiveRow = item.id
    })

    if (newIdActiveRow !== idActiveRow)
      setState({ ...actualStateRef.current, idActiveRow: newIdActiveRow })
  }

  UpdateIdActiveRow(numActiveRow, idActiveRow)

  useEffect(() => {
    console.log('Table: componentDidMount')    
    // console.log('Table: skipEvents', skipEvents)

    if(!skipEvents)
      document.addEventListener('keydown', keyboardTable, false)
    return () => {
      console.log('Table: componentWillUnmount')
      if(!skipEvents)
        document.removeEventListener('keydown', keyboardTable, false)
    }
  }, [])

  const keyboardTable = (event:any) => {
    const {
      numActiveRow,
      maxActiveRow,
      isModalInfo,
      idActiveRow
    } = actualStateRef.current
    //console.log('keyboardTable:', event.keyCode)    

    if(parentKbdListeners !== undefined) {
      if(!isKbdEventActive(event, parentKbdListeners)) {
        //console.log('Send Key - to parent and event NOT active')
        return
      }
      //console.log('Send Key - to parent and event Active')
    }

    let newActiveRow = typeof numActiveRow === 'number' ? numActiveRow : parseInt(numActiveRow)
    let isNavigateKey = false
    if (event.keyCode === 40) {
      // KeyDown
      newActiveRow++
      isNavigateKey = true
    }
    if (event.keyCode === 38) {
      // KeyUp
      newActiveRow--
      isNavigateKey = true
    }
    //console.log('keyboardTable maxActiveRow', maxActiveRow, 'newActiveRow', newActiveRow)
    let isOutofBounds = false
    if (newActiveRow < 0) isOutofBounds = true
    if (newActiveRow >= maxActiveRow) isOutofBounds = true
    //console.log('keyboardTable maxActiveRow', maxActiveRow, 'numActiveRow', numActiveRow)

    if (isNavigateKey && !isOutofBounds) {
      event.preventDefault()
      event.stopPropagation()
      // changeActiveRow(newActiveRow)
      //console.log('keyboardTable setState', 'newActiveRow', newActiveRow)
      setState({ ...actualStateRef.current, numActiveRow: newActiveRow })
      UpdateIdActiveRow(newActiveRow, idActiveRow)
    }

    // 115 F4
    // 120 F9
    if (event.keyCode === 27) {
      // esc is pressed
      event.preventDefault()
      event.stopPropagation()
      if (isModalInfo) closeModalInfo(null)
    }

    if (
      event.keyCode === 13 || // Enter
      event.keyCode === 115
    ) {      
      // F4
      event.preventDefault()
      event.stopPropagation()
      let idClicked = idActiveRow
      // console.log('clickOnDataRow: idClicked',idClicked);
      if (idClicked !== null)
        setState({ ...actualStateRef.current, isModalInfo: true, idClicked })
    }

    if (event.keyCode === 120) {
      // F9
      event.preventDefault()
      event.stopPropagation()
      //console.log('F9 on#', idActiveRow, typeof idActiveRow)
      if(changeDetailed !== undefined)
        changeDetailed(idActiveRow, numActiveRow)
    }

    if (event.keyCode === 37) {
      // KeyLeft      
      if(parentKbdListeners !== undefined) {
        if(!isParentListenerFocused(parentKbdListeners)) {
          event.preventDefault()
          event.stopPropagation()
          setFocusOn1st(parentKbdListeners)
        }          
      }
    }

  }

  const dblClickOnDataRow = (event:any) => {
    const { isModalInfo } = actualStateRef.current
    if (!isModalInfo) {
      let idActiveRow = parseInt(event.target.getAttribute('data-tag'))
      if(changeDetailed !== undefined)
        changeDetailed(idActiveRow, numActiveRow)
    }
  }

  const clickOnDataRow = (event:any) => {
    const { isModalInfo, idActiveRow } = actualStateRef.current
    if (!isModalInfo) {
      let idClicked = parseInt(event.target.getAttribute('data-tag'))
      let numActiveRow = parseInt(event.target.getAttribute('data-row'))
      // console.log('clickOnDataRow: idClicked',idClicked);
      if (idClicked === idActiveRow)
        setState({
          ...actualStateRef.current,
          isModalInfo: true,
          idClicked,
          numActiveRow
        })
      else
        setState({
          ...actualStateRef.current,
          idActiveRow: idClicked,
          idClicked,
          numActiveRow
        })
    }
  }

  const closeModalInfo = (event:any) => {
    // change state force component re-render
    setState({ ...actualStateRef.current, isModalInfo: false })
  }

  //console.log('Table: render')
  // <div className={'ActiveRow'+(numActiveRow-i).toString()}></div>
  return (
    <div className='frameDataTable'>
      <table className='DataTable'>
        <thead>
          <RowHead
            data={arrData}
            skipEvents={skipEvents}
            changeSortOrder={changeSortOrder}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            getColumnName={getColumnName}
          />
        </thead>
        <tbody>
          {arrData.map((line, i) => (
            <Row
              key={i}
              data={line}
              skipEvents={skipEvents}
              getColumnName={getColumnName}
              clickOnDataRow={clickOnDataRow}
              dblClickOnDataRow={dblClickOnDataRow}
              row={i}
              numActiveRow={numActiveRow}
            />
          ))}
        </tbody>
      </table>
      <div>
        <ModalInfo
          arrData={arrData}
          isModalInfo={isModalInfo}
          idClicked={idClicked}
          closeModalInfo={closeModalInfo}
          getColumnName={getColumnName}
        />
      </div>
    </div>
  )
}

export default Table
