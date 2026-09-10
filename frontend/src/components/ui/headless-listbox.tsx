"use client"

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ListboxOptionItem {
  value: string;
  label: string;
}

export interface HeadlessListboxProps {
  options: (string | ListboxOptionItem)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  disabled?: boolean;
}

export function HeadlessListbox({
  options,
  value,
  onChange,
  placeholder,
  className,
  buttonClassName,
  optionsClassName,
  disabled = false,
}: HeadlessListboxProps) {
  const normalizedOptions: ListboxOptionItem[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption
    ? selectedOption.label
    : (value || placeholder || 'Seleccionar');

  return (
    <div className={twMerge('w-full relative', className)}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={twMerge(
              clsx(
                'relative block w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-left text-gray-700 outline-none transition-all font-medium',
                'focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20',
                'pr-10', // make space for the chevron
                'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs',
                buttonClassName
              )
            )}
          >
            <span
              className={clsx(
                'block truncate',
                !selectedOption && !value && placeholder ? 'text-gray-400 font-normal' : 'text-gray-800'
              )}
            >
              {displayLabel}
            </span>
            <ChevronDownIcon
              className="group pointer-events-none absolute top-1/2 -translate-y-1/2 right-3.5 size-5 text-gray-400 transition-transform duration-200 group-data-[open]:rotate-180"
              aria-hidden="true"
            />
          </ListboxButton>
        </div>

        <ListboxOptions
          anchor="bottom"
          transition
          className={twMerge(
            clsx(
              'w-[var(--button-width)] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl z-50 focus:outline-none mt-1',
              'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 max-h-60 overflow-y-auto',
              optionsClassName
            )
          )}
        >
          {normalizedOptions.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 select-none data-[focus]:bg-blue-50/80 data-[selected]:bg-blue-50 data-[selected]:text-[#0B84FF] text-gray-700 transition-colors"
            >
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <CheckIcon className="invisible size-4 text-[#0B84FF] group-data-[selected]:visible" />
              </div>
              <div className="text-sm font-medium">{option.label}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
}

