import React, { Component } from "react"

export const ListboxContext = React.createContext({})

type Props = {
  children: React.ReactNode,
  className?: string,
  value: string,
  onChange: (value: string) => void
}

type State = {
  typeahead: string,
  listboxButtonRef: HTMLElement | null,
  listboxListRef: HTMLElement | null,
  isOpen: boolean,
  activeItem: string,
  values: string[],
  labelId: string | null,
  buttonId: string | null,
  optionIds: Array<[string, string]>,
  optionRefs: Array<[string, HTMLElement]>,
}

export class Listbox extends Component<Props, State> {
  constructor(props: Props){
    super(props)
    this.state = {
      typeahead: "",
      listboxButtonRef: null,
      listboxListRef: null,
      isOpen: false,
      activeItem: this.props.value,
      values: [],
      labelId: null,
      buttonId: null,
      optionIds: [],
      optionRefs: [],
    }
  }

  getActiveDescendant = (): string | null => {
    const [, id] = this.state.optionIds.find(([value]) => value === this.state.activeItem) || [null, null]
    return id
  }

  registerOptionId = (value: string, optionId: string): void => {
    this.unregisterOptionId(value)
    this.setState(prevState => ({ optionIds: [...prevState.optionIds, [value, optionId]] } ))
  }

  unregisterOptionId = (value: string): void => {
    this.setState(prevState => ({ optionIds: prevState.optionIds.filter(([candidateValue]) => candidateValue !== value) }) )
  }

  type = (value: string): void => {
    this.setState(prevState => ({ typeahead: prevState.typeahead.concat(value) }), () => {
      const [match] = this.state.optionRefs.find(
        ([, ref]) => {
          const el: HTMLElement = ref
          return el.innerText.toLowerCase().startsWith(this.state.typeahead.toLowerCase())
        }
      ) || [null]
  
      if (match !== null) { this.focus(match) }
  
      this.clearTypeahead()
    })
  }

  clearTypeahead = (): void => { 
    setTimeout(() => {this.setState({ typeahead: "" }) }, 500)
  }

  registerOptionRef = (value: string, optionRef: HTMLElement): void => {
    this.unregisterOptionRef(value)
    this.setState(prevState => ({ optionRefs: [...prevState.optionRefs, [value, optionRef]] }))
  }

  unregisterOptionRef = (value: string): void => {
    this.setState(prevState => ({ optionRefs:  prevState.optionRefs.filter(([candidateValue]) => candidateValue !== value) }))
  }

  toggle = (): void => { this.state.isOpen ? this.close() : this.open() }

  open = (): void => {
    this.setState({ isOpen: true }, () => {
      process.nextTick(() => {
        if (this.state.listboxListRef){
          this.focus(this.props.value)
          process.nextTick(() => {
            this.state.listboxListRef?.focus()
          })
        }
      })
    })
  }
  
  close = (): void => {
    this.setState({ isOpen: false }, () => { this.state.listboxButtonRef?.focus() })
  }
  
  select = (value: string): void => {
    this.props.onChange(value)
    process.nextTick(() => {
      this.close()
    })
  }
  
  focus = (value: string): void => {
    this.setState({ activeItem: value }, () => {
      if (value === null){ return }
      this.state.listboxListRef?.children[this.state.values.indexOf(this.state.activeItem)].scrollIntoView({ block: "nearest" })
    })
  }

  setListboxButtonRef = (ref: HTMLElement): void => { this.setState({ listboxButtonRef: ref })}
  setListboxListRef = (ref: HTMLElement): void => { this.setState({ listboxListRef: ref })}
  setButtonId = (id: string): void => { this.setState({ buttonId: id })}
  setLabelId = (id: string): void => { this.setState({ labelId: id })}
  setValues = (values: string[]): void => { this.setState({ values })}
  setActiveItem = (activeItem: string): void => { this.setState({ activeItem })}

  render(): React.ReactNode {
    const { children, className } = this.props
    const { isOpen } = this.state

    const ProvidedContext = {
      getActiveDescendant: this.getActiveDescendant,
      registerOptionId: this.registerOptionId,
      unregisterOptionId: this.unregisterOptionId,
      registerOptionRef: this.registerOptionRef,
      unregisterOptionRef: this.unregisterOptionRef,
      toggle: this.toggle,
      open: this.open,
      close: this.close,
      select: this.select,
      focus: this.focus,
      clearTypeahead: this.clearTypeahead,
      typeahead: this.state.typeahead,
      type: this.type,
      setListboxListRef: this.setListboxListRef,
      setListboxButtonRef: this.setListboxButtonRef,
      listboxButtonRef: this.state.listboxButtonRef,
      listboxListRef: this.state.listboxListRef,
      isOpen: this.state.isOpen,
      activeItem: this.state.activeItem,
      setActiveItem: this.setActiveItem,
      values: this.state.values,
      setValues: this.setValues,
      labelId: this.state.labelId,
      setLabelId: this.setLabelId,
      buttonId: this.state.buttonId,
      setButtonId: this.setButtonId,
      props: this.props,
    }

    return (
      <ListboxContext.Provider value={ProvidedContext}>
        <div className={className}>
          { children instanceof Function ? children({ isOpen }) : children }
        </div>
      </ListboxContext.Provider>
    )
  }
}

export default null
