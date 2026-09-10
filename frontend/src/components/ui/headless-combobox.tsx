"use client"

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useState } from 'react'

interface HeadlessComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HeadlessCombobox({ options, value, onChange, placeholder }: HeadlessComboboxProps) {
  const [query, setQuery] = useState('')

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          return option.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <div className="w-full">
      <Combobox value={value} onChange={onChange} onClose={() => setQuery('')}>
        <div className="relative">
          <ComboboxInput
            className={clsx(
              'w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none transition-all font-medium',
              'focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20',
              'pr-10' // make space for the chevron
            )}
            displayValue={(opt: string) => opt}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-3 flex items-center h-full">
            <ChevronDownIcon className="size-5 text-gray-400 group-data-[hover]:text-gray-600 transition-colors" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'w-[var(--input-width)] rounded-xl border border-gray-100 bg-white p-1 shadow-lg z-50 empty:invisible mt-1',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 max-h-60 overflow-y-auto'
          )}
        >
          {filteredOptions.length === 0 && query !== '' ? (
            <div className="px-4 py-2 text-sm text-gray-500">No se encontraron resultados.</div>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxOption
                key={option}
                value={option}
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 select-none data-[focus]:bg-blue-50 data-[focus]:text-[#0B84FF] text-gray-700 transition-colors"
              >
                <CheckIcon className="invisible size-4 text-[#0B84FF] group-data-[selected]:visible" />
                <div className="text-sm font-medium">{option}</div>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}
