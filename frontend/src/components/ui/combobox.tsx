"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { cn } from "../../lib/utils"

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-r-md bg-transparent hover:bg-gray-100 text-gray-500 transition-colors [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear 
      data-slot="combobox-clear" 
      className={cn("flex h-9 w-9 items-center justify-center rounded-md bg-transparent hover:bg-gray-100 text-gray-500 transition-colors", className)} 
      {...props} 
      render={<button type="button" aria-label="Clear"><XIcon className="pointer-events-none size-4" /></button>} 
    />
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <div className={cn("flex items-center w-full rounded-md border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all", className)}>
      <ComboboxPrimitive.Input
        className="flex h-9 w-full rounded-l-md bg-transparent px-3 py-1 text-sm shadow-none outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        {...props}
      />
      <div className="flex items-center">
        {showClear && <ComboboxClear disabled={disabled} />}
        {showTrigger && (
          <ComboboxTrigger disabled={disabled} />
        )}
      </div>
      {children}
    </div>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] w-[var(--anchor-width)] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80 zoom-in-95", 
            className 
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden p-1",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator 
        render={<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center"><CheckIcon className="h-4 w-4" /></span>} 
      />
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "py-6 text-center text-sm text-gray-500",
        className
      )}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxTrigger,
  ComboboxValue,
}
