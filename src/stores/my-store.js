import { observable, decorate } from 'mobx'
import MyPokedex from '../api/pclass'

export class MyStore {
  /* OBSERVABLE *    * OBSERVER *   * COMPONENT *
   arrData              Table
   searchByType         Header
   introScreen          Table        IntroButton
   choosenItemImg       Table        ModalInfo
   pkdxLoadedItems      NavPanel
   pageTotal            NavPanel
   pageCurrent          NavPanel
   pageNavigate         NavPanel

   *** EVENTS ***      * SRC *      * COMPONENT *
   closeModalInfo       Table        ModalInfo
   clickOnDataRow       Table        Row              
   showMePokedex        Table        IntroButton
   changeSortOrder      Table        RowHead
   changeItemsPerPage   Header       Header   
   changeDataOffset     (not used more)
   setDataOffset        (not used more)
   changeFilter         Header       Header   
   changeFilterType     Header       Header   
   changeCurrentPage    NavPanel     NavPanel
   navigatePanel        NavPanel     NavPanel
  */

  choosenItemImg = undefined
  choosenArrData = []
  searchByType = '-'
  itemsPerPage = 10
  filterRow = undefined
  filterType = undefined
  pkdxDataOffset = 0
  pkdxTotal = undefined
  pkdxLoadedItems = 0
  pkdxAllItemsLoaded = false

  pageNavigateMax = 15
  pageTotal = 0
  pageCurrent = -1
  pageNavigate = 1

  arrDataFiltered = []
  arrData = [
    { Author: 'Vitaly Chaikin', Description: 'Hello !' },
    {
      Author: '',
      Description: 'This is a Pokedex test project using ReactJS + MobX.'
    },
    {
      Author: '',
      Description:
        'Javascript is something new for me, so to complete the test task'
    },
    {
      Author: '',
      Description:
        'it was necessary to study ES6, Nodejs and Reactjs basics, CSS and MobX trics.'
    },
    {
      Author: '',
      Description:
        'The hardest part seemed to be using promises inside Pokedex-api.'
    },
    {
      Author: '',
      Description: 'I had to figure it out in detail using the console.'
    },
    {
      Author: '',
      Description:
        'As a result, we got (as you see) this table component that displays any array'
    },
    { Author: '', Description: ' of the form:' },
    {
      Author: '',
      Description:
        "  arrData = [ {Author: 'Vitaly Chaikin', Description: 'Hello !' }, {...} ];"
    },
    { Author: '', Description: '' },
    {
      Author: '',
      Description:
        'The number of columns will correspond to the properties of the object {};'
    },
    {
      Author: '',
      Description:
        'Each column and each cell has its own css style. Layout is adaptive.'
    },
    {
      Author: '',
      Description:
        'You can sort the visible data by clicking on the column name.'
    },
    {
      Author: '',
      Description:
        'Warning! If you set offset 800, data received from Pokedex-api looks strange !'
    },
    {
      Author: '',
      Description:
        'Despite the fact that the total number of Pokemons 964, some of them ...'
    },
    { Author: '', Description: 'have a higher id ?!' },
    {
      Author: '',
      Description:
        'Аnd remember getting data on 50-100-200 pokemons may take more than 5 seconds'
    }
  ]
  introScreen = true

  myP = new MyPokedex() // Pokedex-API instance

  closeModalInfo = event => {
    this.choosenItemImg = undefined // change observable force component re-render
  }

  clickOnDataRow = event => {
    if (!this.introScreen) {
      let idClicked = parseInt(event.target.getAttribute('tag'))
      //console.log('idClicked',idClicked);
      this.choosenArrData = this.myP.dataRows.filter(({ id }) => {
        return id === idClicked
      })
      //console.log('this.choosenArrData',this.choosenArrData);
      this.choosenItemImg = this.choosenArrData[0]['img']
    }
  }

  showMePokedex = event => {
    // click on 'Start' button
    this.introScreen = false
    // this.requestDataRows();  // No more request just update
    this.updateDataRows()
  }
  changeSortOrder = event => {
    // click on Column header
    let arg1
    let lenBeforeSpace = event.target.className.indexOf(' ') // Take first className='class1 class2 class3'
    // console.log('event.target.className=(',event.target.className,') lenBeforeSpace= ', lenBeforeSpace, 'this.myP.sortColumn = ', this.myP.sortColumn);
    if (-1 === lenBeforeSpace) arg1 = event.target.className
    else arg1 = event.target.className.slice(0, lenBeforeSpace)
    //console.log('arg1= ', arg1, 'this.myP.sortColumn = ', this.myP.sortColumn);

    if (arg1 === this.myP.sortColumn)
      this.myP.sortDirection = -this.myP.sortDirection
    else this.myP.sortDirection = 1
    this.myP.sortDataRows(arg1)
    this.updateDataRows()
  }

  changeItemsPerPage = event => {
    // new value View on page:
    this.introScreen = false
    this.itemsPerPage = parseInt(event.target.value)
    this.myP.namesOnPage = this.itemsPerPage
    // this.requestDataRows();  // No more request just update
    this.updateDataRows()
  }

  changeDataOffset = event => {
    // new value entered to Offset field component (onBlur)
    const newDataOffset = parseInt(event.target.value)
    if (!isNaN(newDataOffset)) this.pkdxDataOffset = newDataOffset
    else console.log('NAN')
  }

  setDataOffset = event => {
    // button [Set] clicked
    this.myP.dataOffset = this.pkdxDataOffset
    // this.requestDataRows();  // No more request just update
    this.updateDataRows()
  }

  changeFilter = event => {
    this.introScreen = false
    this.filterRow = event.target.value.toLowerCase() // all data in lowercase
    this.updateDataRows()
  }

  changeFilterType = event => {
    this.introScreen = false
    this.filterType = event.target.value.toLowerCase() // all data in lowercase
    this.updateDataRows()
  }

  changeCurrentPage = event => {
    this.pageCurrent = parseInt(event.target.getAttribute('tag'))
    //console.log(this.pageCurrent);
    this.updateDataRows()
  }

  navigatePanel = event => {
    const navigateDirection = parseInt(event.target.getAttribute('tag'))
    const newPageNavigate = this.pageNavigate + navigateDirection
    //console.log('nav#',this.pageNavigate,newPageNavigate,'total',this.pageTotal, 'nav+max',(newPageNavigate+this.pageNavigateMax-1));
    if (
      newPageNavigate >= 1 &&
      newPageNavigate + this.pageNavigateMax - 1 <= this.pageTotal
    )
      this.pageNavigate = newPageNavigate
    // console.log(navigateDirection);
    // this.updateDataRows();
  }

  navigateFixPage (newPageNavigate) {
    if (newPageNavigate > this.pageTotal) newPageNavigate = 1
    if (newPageNavigate + this.pageNavigateMax - 1 > this.pageTotal)
      newPageNavigate = this.pageTotal - this.pageNavigateMax + 1
    //console.log('nav#',this.pageNavigate,newPageNavigate,'total',this.pageTotal, 'nav+max',(newPageNavigate+this.pageNavigateMax-1));
    if (
      newPageNavigate >= 1 &&
      newPageNavigate + this.pageNavigateMax - 1 <= this.pageTotal
    )
      this.pageNavigate = newPageNavigate
  }

  filterDataRows () {
    if (
      (this.filterRow === undefined || this.filterRow === '') &&
      (this.filterType === undefined || this.filterType === '-')
    )
      return this.myP.dataRows
    else {
      return this.myP.dataRows.filter(({ name, type1, type2 }) => {
        let passFilter1, passFilter2
        if (typeof name === 'string')
          if (this.filterRow === undefined || this.filterRow === '')
            // is column exist
            passFilter1 = true
          else passFilter1 = !(name.indexOf(this.filterRow) === -1)
        // filter rows
        else passFilter1 = false

        if (typeof type1 === 'string' && typeof type2 === 'string')
          if (this.filterType === undefined || this.filterType === '-')
            // is column exist
            passFilter2 = true
          else
            passFilter2 = type1 === this.filterType || type2 === this.filterType
        // filter rows
        else passFilter2 = false
        return passFilter1 && passFilter2
      })
    }
  }

  requestDataRows () {
    // request data from Pokedex
    this.myP.initialize(this.countDataRows, this)
    // .then( () => {
    //   //this.myP.fillDataRows().then(() => {
    //      this.pkdxTotal = this.myP.total;
    //      this.pkdxLoadedItems = this.myP.dataRows.length;
    //      //this.updateDataRows();
    //   //});
    // });
  }

  countDataRows (this_) {
    if (this_.myP.total > 0) {
      // Should continue receive data after Empty response
      this_.pkdxTotal = this_.myP.total
      this_.pkdxLoadedItems = this_.myP.dataRows.length
      this_.pkdxAllItemsLoaded = this_.pkdxLoadedItems >= this_.pkdxTotal
      // if (this_.pkdxAllItemsLoaded)
      //  console.log('this_.pkdxLoadedItems',this_.pkdxLoadedItems,'this_.pkdxTotal',this_.pkdxTotal)
    }
  }

  updateDataRows () {
    // put data to Observable
    // this.pkdxLoadedItems = this.myP.dataRows.length
    // console.log(this.arrDataFiltered,typeof this.arrDataFiltered);
    this.arrDataFiltered = this.filterDataRows() // .slice(0, this.myP.namesOnPage);
    let lastPageItems = this.arrDataFiltered.length % this.itemsPerPage
    this.pageTotal =
      (this.arrDataFiltered.length - lastPageItems) / this.itemsPerPage
    if (this.pageTotal === 0) this.pageTotal = 1
    else if (lastPageItems !== 0) this.pageTotal++
    if (this.pageCurrent < 0 || this.pageCurrent > this.pageTotal) {
      this.pageCurrent = 1
      // this.pageNavigate = 1;
    }
    //this.pageNavigate = this.pageCurrent;
    //console.log('this.pageCurrent',this.pageCurrent);
    //console.log('this.pageNavigate',this.pageNavigate);

    this.navigateFixPage(this.pageCurrent)

    let lowIndex = (this.pageCurrent - 1) * this.itemsPerPage
    let hiIndex = this.pageCurrent * this.itemsPerPage - 1

    this.arrData.replace(
      this.arrDataFiltered.filter((v, i) => i >= lowIndex && i <= hiIndex)
    )
  }
}

MyStore = decorate(MyStore, {
  searchByType: observable,
  arrData: observable,
  introScreen: observable,
  choosenItemImg: observable,
  pkdxLoadedItems: observable,
  pageTotal: observable,
  pageCurrent: observable,
  pageNavigate: observable
})
