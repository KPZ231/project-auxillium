# AUXILIUM Form Design Conventions

This document outlines the design and implementation standards for forms within the Auxilium platform. We follow the **StudioBlank** design system: an ultra-minimal, industrial-utilitarian aesthetic focused on whitespace, bold typography, and sharp geometric edges.

## 1. Design Principles

- **Zero Radius**: No rounded corners (`rounded-none`) on any inputs, buttons, or containers.
- **Monochrome Palette**: Stick to `#0A0A0A` (Black), `#FAFAFA` (Off-white), and `#71717A` (Zinc-500) for UI chrome.
- **Typography as Hierarchy**: Use uppercase, tracking-widest, and bold weights for labels instead of size variations.
- **Utilitarian Transitions**: Animations should be fast (<= 200ms) and functional (e.g., border color shifts).
- **Whitespace as Structure**: Use generous padding and gaps (`space-y-8`, `gap-8`) to separate logical sections.

## 2. Core Components

Always use the premium components from `@/app/components/UI/FormElements`:

### `PremiumInput`
- **When to use**: Standard text, email, phone, or number entries.
- **Design**: 1px Zinc border that turns 2px Black on focus. Upper-case labels.
- **Helper Text**: Use for subtle instructions below the input.

### `PremiumTextarea`
- **When to use**: Multi-line notes, descriptions, or long-form content.
- **Design**: Same border logic as input. Fixed height or specific `rows` recommended.

### `PremiumSelect`
- **When to use**: Choosing from a predefined set of options.
- **Design**: Custom arrow icon, same border logic.

## 3. Form Layout Patterns

### Steppers (Wizard Mode)
- **Header**: Use a high-contrast progress bar (Zinc background, Black active segment).
- **Sectioning**: Each step should have a clear "Step X of Y" indicator and a bold section title with a left-accent border.
- **Navigation**: "Back" (Ghost/Bordered) on the left, "Continue" (Primary/Filled) on the right.

### Edit Modals
- **Sticky Header/Footer**: Keep navigation buttons visible while scrolling long forms.
- **Section Dividers**: Use `border-l-4 border-[#0A0A0A]` with internal padding to mark logical groups (e.g., "Basic Information", "Contact Details").

### Verification (Dangerous Actions)
- Use the **Verification Input** pattern for deletions:
  - User must type the object name exactly (e.g., "Confirm delete Acme Corp").
  - Use `PremiumInput` with an `error` state if the names don't match.

## 4. Interaction & UX

- **Focus States**: Every interactive element must have a clear visual focus state (usually a 2px black border).
- **Validation**: Surface errors immediately using the `error` prop. Errors should be `#DC2626` (Red-600).
- **Submitting States**: Disable buttons and show "Saving..." or "Processing..." labels to prevent double submissions.
- **Uppercase Labels**: All labels MUST be uppercase with `tracking-widest` to maintain the industrial look.

## 5. Code Example

```tsx
<div className="space-y-12">
  <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
    <h3 className="text-[14px] font-black uppercase tracking-[0.15em]">Section Title</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <PremiumInput 
      label="Label Name" 
      placeholder="Utilitarian placeholder" 
      required
    />
    <PremiumSelect 
      label="Category" 
      options={[{ value: 'A', label: 'Option A' }]}
    />
  </div>
</div>
```
