// lib/templates/variables.ts

export type VariableSource = 'client' | 'deal' | 'user' | 'system' | 'custom'

export interface TemplateVariable {
  key: string          // np. "client.name"
  label: string        // np. "Nazwa klienta"
  source: VariableSource
  example: string      // np. "Firma XYZ Sp. z o.o."
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Klient
  { key: 'client.name',       label: 'Nazwa klienta',     source: 'client', example: 'Firma XYZ Sp. z o.o.' },
  { key: 'client.address',    label: 'Adres klienta',     source: 'client', example: 'ul. Marszałkowska 1, Warszawa' },
  { key: 'client.nip',        label: 'NIP klienta',       source: 'client', example: '123-456-78-90' },
  { key: 'client.email',      label: 'Email klienta',     source: 'client', example: 'kontakt@firma.pl' },
  { key: 'client.phone',      label: 'Telefon klienta',   source: 'client', example: '+48 000 000 000' },
  
  // Deal / Projekt
  { key: 'deal.title',        label: 'Nazwa projektu',    source: 'deal',   example: 'Sklep Shopify Premium' },
  { key: 'deal.value',        label: 'Wartość projektu',  source: 'deal',   example: '12 500,00 PLN' },
  { key: 'deal.deadline',     label: 'Termin realizacji', source: 'deal',   example: '30 czerwca 2026' },
  { key: 'deal.description',  label: 'Opis projektu',     source: 'deal',   example: 'Wdrożenie nowoczesnego e-commerce...' },
  
  // Użytkownik (wystawca)
  { key: 'user.name',         label: 'Twoje imię i nazwisko', source: 'user', example: 'Kacper Duda' },
  { key: 'user.company',      label: 'Twoja firma',       source: 'user',   example: 'KPZsProductions' },
  { key: 'user.email',        label: 'Twój email',        source: 'user',   example: 'kacper@kpzs.pl' },
  { key: 'user.phone',        label: 'Twój telefon',      source: 'user',   example: '+48 123 456 789' },
  
  // System
  { key: 'system.date',       label: 'Dzisiejsza data',   source: 'system', example: '16 maja 2026' },
  { key: 'system.date_short', label: 'Data (krótka)',     source: 'system', example: '16.05.2026' },
  { key: 'system.doc_number', label: 'Numer dokumentu',   source: 'system', example: 'OF/2026/042' },
  { key: 'system.page',       label: 'Numer strony',      source: 'system', example: '1' },
  { key: 'system.total_pages',label: 'Suma stron',        source: 'system', example: '5' },
]

export function getVariableExample(key: string): string {
  const variable = TEMPLATE_VARIABLES.find(v => v.key === key)
  return variable?.example || `{{${key}}}`
}
