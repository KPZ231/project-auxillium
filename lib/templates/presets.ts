// lib/templates/presets.ts

export interface TemplatePreset {
  id: string
  name: string
  type: string
  icon: string
  description: string
  content: string
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'offer',
    name: 'Oferta handlowa',
    type: 'offer',
    icon: '📋',
    description: 'Propozycja cenowa dla klienta',
    content: `# Oferta handlowa: {{deal.title}}

Szanowni Państwo,

Dziękujemy za zainteresowanie naszymi usługami. Poniżej przedstawiamy szczegółową ofertę przygotowaną dla **{{client.name}}**.

## Zakres prac
{{deal.description}}

## Kosztorys
| Usługa | Wartość |
| :--- | :--- |
| Realizacja projektu | {{deal.value}} |

## Termin realizacji
Przewidywany termin zakończenia: **{{deal.deadline}}**

Z poważaniem,
**{{user.name}}**
{{user.company}}
`
  },
  {
    id: 'contract',
    name: 'Umowa o wykonanie',
    type: 'contract',
    icon: '📝',
    description: 'Kontrakt na realizację projektu',
    content: `# Umowa o świadczenie usług nr {{system.doc_number}}

Zawarta w dniu {{system.date}} pomiędzy:

**Wykonawcą:**
{{user.company}}
reprezentowanym przez: {{user.name}}

a

**Zleceniodawcą:**
{{client.name}}
z siedzibą w: {{client.address}}
NIP: {{client.nip}}

## § 1 Przedmiot Umowy
Przedmiotem umowy jest realizacja projektu: **{{deal.title}}**.

## § 2 Wynagrodzenie
Strony ustalają wynagrodzenie w kwocie: **{{deal.value}}**.

...
`
  },
  {
    id: 'nda',
    name: 'NDA',
    type: 'nda',
    icon: '🔒',
    description: 'Umowa poufności',
    content: `# Umowa o zachowaniu poufności (NDA)

Niniejsza umowa zostaje zawarta pomiędzy **{{user.company}}** a **{{client.name}}**.

Obie strony zobowiązują się do zachowania w tajemnicy wszelkich informacji poufnych przekazanych w toku współpracy przy projekcie.
`
  }
]
