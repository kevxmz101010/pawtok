"use client"

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

interface HeadlessListboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HeadlessListbox({ options, value, onChange, placeholder }: HeadlessListboxProps) {
  return (
    <div className="w-full">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'relative block w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-left text-gray-700 outline-none transition-all font-medium',
              'focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20',
              'pr-10' // make space for the chevron
            )}
          >
            <span className="block truncate">{value || placeholder}</span>
            <ChevronDownIcon
              className="group pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 size-5 text-gray-400"
              aria-hidden="true"
            />
          </ListboxButton>
        </div>

        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'w-[var(--button-width)] rounded-xl border border-gray-100 bg-white p-1 shadow-lg z-50 focus:outline-none mt-1',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 max-h-60 overflow-y-auto'
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option}
              value={option}
              className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 select-none data-[focus]:bg-blue-50 data-[focus]:text-[#0B84FF] text-gray-700 transition-colors"
            >
              <CheckIcon className="invisible size-4 text-[#0B84FF] group-data-[selected]:visible" />
              <div className="text-sm font-medium">{option}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
}
