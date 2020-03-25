import React, { useState, useEffect, useRef } from 'react'
// import { observer } from 'mobx-react-lite'
// import { useStores } from '../hooks/use-stores'

const RowHead = ({
  data: arr,
  skipEvents,
  changeSortOrder,
  sortColumn: p_sortColumn,
  sortDirection: p_sortDirection,
  getColumnName: p_getColumnName
}) => {
  // const { myStore } = useStores()
  // let p = myStore.myP

  //console.log('skipEvents',skipEvents);
  let sorted
  let thList = []
  if (arr.length === 0) thList.push(<th key='noitems'>Нет данных</th>)
  else {
    let onClickEvent = undefined
    if (!skipEvents) onClickEvent = changeSortOrder
    // Use keys of first element for Column names
    Object.keys(arr[0]).forEach((element, key) => {
      sorted = undefined
      if (!skipEvents)
        if (element === p_sortColumn) {
          // dont decorate sorted column if skipEvent = true
          sorted = 'sortColumn' + p_sortDirection.toString()
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
const Row = ({
  data: line,
  skipEvents,
  getColumnName: p_getColumnName,
  clickOnDataRow,
  dblClickOnDataRow,
  row,
  numActiveRow
}) => {
  // const { myStore } = useStores()
  // let p = myStore.myP

  let id = undefined
  let trColumns = []
  for (const property in line) {
    let columnName = p_getColumnName(property)
    // console.log('property', property, 'columnName', columnName, !(columnName==='hidden'));
    if (!(columnName === 'hidden')) {
      let className = 'td' + property // set className = 'tdname' for css selector
      let element = line[property]
      if (className === 'tdid') id = element
      if (className === 'tdtype1' || className === 'tdtype2')
        className += element // tdtype1/tdtype2 also have value like: tdtype1fire
      trColumns.push(
        <td className={className} key={property} tag={id} row={row}>
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

  let trRow = []
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

const ModalInfo = Props => {
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

const Table = Props => {
  //const { myStore } = useStores()
  const arrData = Props.data
  const changeSortOrder = Props.changeSortOrder // Callback for changeSortOrder
  const skipEvents = Props.skipEvents
  const sortColumn = Props.sortColumn
  const sortDirection = Props.sortDirection
  const getColumnName = Props.getColumnName
  const changeDetailed = Props.changeDetailed
  const setActiveRow = Props.numActiveRow
  // const changeActiveRow = Props.changeActiveRow // <-- Передается но не используется

  // console.log('Table::setActiveRow', setActiveRow)
  // const clickOnDataRow = Props.clickOnDataRow     // Callback for clickOnDataRow

  // console.log('Table props:arrData',arrData.length);

  const [state, _setState] = useState({
    isModalInfo: false,
    idClicked: -1,
    numActiveRow: setActiveRow,
    maxActiveRow: arrData.length,
    idActiveRow: null
  })

  // define a ref, for use inside event Listener !
  const actualStateRef = useRef(state)

  // in place of original `setState`
  const setState = x => {
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
  const UpdateIdActiveRow = (numActiveRow, idActiveRow) => {
    let newIdActiveRow = null
    arrData.forEach((item, index) => {
      if (numActiveRow === index) newIdActiveRow = item.id
    })

    if (newIdActiveRow !== idActiveRow)
      setState({ ...actualStateRef.current, idActiveRow: newIdActiveRow })
  }

  UpdateIdActiveRow(numActiveRow, idActiveRow)

  useEffect(() => {
    // console.log('componentDidMount')
    document.addEventListener('keydown', keyboardTable, false)
    return () => {
      // console.log('componentWillUnmount')
      document.removeEventListener('keydown', keyboardTable, false)
    }
  }, [])

  const keyboardTable = event => {
    const {
      numActiveRow,
      maxActiveRow,
      isModalInfo,
      idActiveRow
    } = actualStateRef.current
    // console.log('Key - Pressed:', event.keyCode)
    //console.log('keyboardTable maxActiveRow', maxActiveRow, 'numActiveRow', numActiveRow)

    let newActiveRow = numActiveRow
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
      // changeActiveRow(newActiveRow)
      //console.log('keyboardTable setState', 'newActiveRow', newActiveRow)
      setState({ ...actualStateRef.current, numActiveRow: newActiveRow })
      UpdateIdActiveRow(newActiveRow, idActiveRow)
    }

    // 115 F4
    // 120 F9
    if (event.keyCode === 27) {
      // esc is pressed
      if (isModalInfo) closeModalInfo()
    }

    if (
      event.keyCode === 13 || // Enter
      event.keyCode === 115
    ) {
      // F4
      let idClicked = idActiveRow
      // console.log('clickOnDataRow: idClicked',idClicked);
      if (idClicked !== null)
        setState({ ...actualStateRef.current, isModalInfo: true, idClicked })
    }

    if (event.keyCode === 120) {
      // F9
      //console.log('F9 on#', idActiveRow, typeof idActiveRow)
      changeDetailed(idActiveRow, numActiveRow)
    }
  }

  const dblClickOnDataRow = event => {
    const { isModalInfo } = actualStateRef.current
    if (!isModalInfo) {
      let idActiveRow = parseInt(event.target.getAttribute('tag'))
      changeDetailed(idActiveRow, numActiveRow)
    }
  }

  const clickOnDataRow = event => {
    const { isModalInfo, idActiveRow } = actualStateRef.current
    if (!isModalInfo) {
      let idClicked = parseInt(event.target.getAttribute('tag'))
      let numActiveRow = parseInt(event.target.getAttribute('row'))
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

  const closeModalInfo = event => {
    // change state force component re-render
    setState({ ...actualStateRef.current, isModalInfo: false })
  }

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
