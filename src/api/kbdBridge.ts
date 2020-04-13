export interface IParentListener {
 parentFocusedElementId: Array<string>,
 parentFocusedElementListener: Array<any>
}

export const setFocusOn1st = (parentListeners:IParentListener):void => {
  if(parentListeners.parentFocusedElementId.length > 0)
    document.getElementById(parentListeners.parentFocusedElementId[0])?.focus()
}

const getListenerIndex = (focused_element:any, parentListeners:IParentListener):number => {
  let listenerIndex = -1
  parentListeners.parentFocusedElementId.forEach( (elementId, index) => {
    if(elementId === focused_element?.id) {
      listenerIndex = index
    }  
  })
  return listenerIndex
}

export const getFocusedElement = ():Element | null => {
  let focused_element:Element | null = null;
  if (
    document.hasFocus() &&
    document.activeElement !== document.body &&
    document.activeElement !== document.documentElement
  ) {
    focused_element = document.activeElement;
  }
  return focused_element
}

export const isKbdEventActive = (event:any, parentListeners:IParentListener):boolean => {
  const event_keyCode:number = event.keyCode
  let kbdEventStillActive:boolean = true
  const focused_element:Element | null = getFocusedElement();
  
  // console.log('focusedElement', focused_element?.tagName, focused_element?.className, focused_element?.id)
  if(focused_element !== null) {
    kbdEventStillActive = parentListeners.parentFocusedElementListener[getListenerIndex(focused_element, parentListeners)](event_keyCode)
    if(!kbdEventStillActive) {
      event.preventDefault()
      event.stopPropagation()
    }    
  }
  return kbdEventStillActive
}

export const isParentListenerFocused = (parentListeners:IParentListener):boolean => {
  const focused_element:Element | null = getFocusedElement();
  return (getListenerIndex(focused_element, parentListeners) !== -1)
}