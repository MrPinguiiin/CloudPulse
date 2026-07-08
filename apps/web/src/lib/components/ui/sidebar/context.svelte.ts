import { getContext, setContext } from "svelte";
import { SIDEBAR_KEYBOARD_SHORTCUT } from "./constants";

type Getter<T> = () => T;

export type SidebarStateProps = {
  open: Getter<boolean>;
  setOpen: (open: boolean) => void;
};

class SidebarState {
  readonly props: SidebarStateProps;
  setOpen: SidebarStateProps["setOpen"];

  constructor(props: SidebarStateProps) {
    this.props = props;
    this.setOpen = props.setOpen;
  }

  get open() { return this.props.open(); }
  get state() { return this.open ? "expanded" : "collapsed"; }
  get isMobile() { return false; }

  toggle = () => {
    this.setOpen(!this.open);
  };
}

const SYMBOL_KEY = "scn-sidebar";

export function setSidebar(props: SidebarStateProps): SidebarState {
  return setContext(Symbol.for(SYMBOL_KEY), new SidebarState(props));
}

export function useSidebar(): SidebarState {
  return getContext<SidebarState>(Symbol.for(SYMBOL_KEY));
}
