# Coming Soon Page Setup

## Page Location
The Coming Soon page is located at: `/[locale]/soon`

## MailerLite Integration

### 1. Get MailerLite API Credentials
1. Sign up for a MailerLite account
2. Go to Developer section in your MailerLite dashboard
3. Create a new API key
4. Note down the API key
5. Create a new group for "Coming Soon Subscribers" and note the Group ID

### 2. Environment Variables
Create a `.env.local` file in your project root:

```env
MAILERLITE_API_KEY=your_api_key_here
MAILERLITE_GROUP_ID=your_group_id_here
```

### 3. Development Mode
In development, the API will work without MailerLite credentials but will only log the email addresses.

### 4. Testing
To test the Coming Soon page:
1. Run `npm run dev`
2. Navigate to `/soon` (or your locale equivalent like `/pl/soon`)
3. Try submitting an email address

## Features
- Responsive design following StudioBlank design system
- Email validation
- Error handling
- Success state
- Countdown timer (static for now)
- Features preview section
- Footer with links

## Customization
- Update the countdown timer in the page.tsx
- Modify features section as needed
- Adjust colors and spacing to match your brand
- Add social media links in footer