# 🏋️ Iron Spirit Gym - Website Customization & Maintenance Guide

Yeh guide aapko batayegi ki aap apni gym website ke kisi bhi section (Hero Slider, Plans, Coaches, FAQs, Timings, Offers etc.) ko **bina coding kiye sirf JSON files edit karke** kaise customize aur update kar sakte hain.

---

## 📁 JSON Files Directory (`/data/`)

Sabhi dynamic content files `data/` folder me hain:

| File Name | Kis Section Ke Liye Hai |
|---|---|
| `data/hero.json` | Top Hero Section (Title, Subtitle, Button, Images, Videos, Logo) |
| `data/gym-info.json` | Gym Ka Address, Phone, WhatsApp Number, Operating Hours, Social Links |
| `data/offers.json` | Top Running Announcement Bar & Special Discount Offer Popup |
| `data/amenities.json` | Training Zones & Equipment Carousel |
| `data/plans.json` | Membership Pricing Cards (1 Month, 3 Months, Annual etc.) |
| `data/trainers.json` | Certified Coaches & Trainer Profiles (Photos, Bio, Specialties, Insta) |
| `data/why-us.json` | Why Choose Us Section (Steps, Features & Stats) |
| `data/testimonials.json` | Member Reviews & Client Stories (Orbital Carousel) |
| `data/faqs.json` | Frequently Asked Questions & Answers (Mobile Carousel + Drawer) |

---

## 🚀 1. Hero Section Customize Karna (`data/hero.json`)

File: `data/hero.json`

```json
{
  "title": "Transform Your",
  "titleHighlight": "Fitness",
  "description": "Ranchi's dedicated unisex fitness gym in Kokar...",
  "cta": {
    "text": "Explore Memberships",
    "link": "#memberships"
  },
  "slides": [
    {
      "type": "logo",
      "src": "main_logo.png",
      "alt": "Official Logo"
    },
    {
      "type": "video",
      "src": "hero.mp4",
      "alt": "Workout Video"
    }
  ]
}
```

### 💡 Slides Me 3 Types Support Hote Hain:

1. **Logo Emblem (`"type": "logo"`):**
   - Sirf right side me floating logo dikhega with red atmospheric background aura.
   ```json
   {
     "type": "logo",
     "src": "main_logo.png",
     "alt": "Iron Spirit Gym Emblem"
   }
   ```

2. **Full-Page Background Image (`"type": "image"`):**
   - Pure Hero section ke background me full-bleed cover image dikhegi.
   ```json
   {
     "type": "image",
     "src": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
     "alt": "Gym Workout Area"
   }
   ```

3. **Full-Page Background Video (`"type": "video"`):**
   - Pure Hero section ke background me autoplay video chalegi.
   ```json
   {
     "type": "video",
     "src": "hero.mp4",
     "alt": "Training Floor"
   }
   ```

*(Hero Slider ka auto-change time 30 seconds set hai)*.

---

## 📞 2. Gym Address, Phone, WhatsApp, Email & Socials (`data/gym-info.json`)

File: `data/gym-info.json`

- **Address update:** `"location.fullAddress"` change karein.
- **Phone Numbers (Multiple or Single):**
  ```json
  "phones": [
    { "number": "+91 98351 24789", "label": "Front Desk & Enquiries" },
    { "number": "+91 98351 24790", "label": "Trainer & Support Desk" }
  ]
  ```
  *(Note: User kisi bhi phone number pe click karega toh usse **"Call Now"** aur **"Copy Number"** ka interactive option sheet milega).*
- **WhatsApp Lines (Multiple or Single):**
  ```json
  "whatsapps": [
    { "number": "919835124789", "label": "Membership Enquiries", "message": "Hi Iron Spirit Gym! I am interested in joining." },
    { "number": "919835124790", "label": "Trainer & Timings Support", "message": "Hi Iron Spirit Gym! I want information regarding gym slots." }
  ]
  ```
- **Email:** `"email": "contact@ironspiritgym.com"` *(Click karne par Open Mail / Copy Email prompt milta hai)*.
- **Gym Timings:** `"timings.weekdays.slots"` aur `"timings.sunday.slots"`.
- **Social Links (Footer & Hero):**
  ```json
  "socials": {
    "instagram": "https://instagram.com",
    "facebook": "https://facebook.com",
    "youtube": "https://youtube.com"
  }
  ```

---

## 🎁 3. Announcement Bar & Discount Image Poster Popup (`data/offers.json`)

File: `data/offers.json`

- **Offer on/off karna:** `"isActive": true` (on) ya `false` (off).
- **Top Bar Text:** `"bannerText": "GRAND OPENING PRIVILEGE: Special Launch Offer..."`
- **Desktop Banner Image:** `"imageDesktop": "bannerPc.png"` (Laptop/PC screens ke liye wide/landscape banner).
- **Mobile Banner Image:** `"imageMobile": "banner.png"` (Phone screens ke liye vertical/portrait poster).
- **Image Tap Link (WhatsApp/Contact):** `"link": "https://wa.me/919835124789?text=..."` (Jab user banner pe click karega toh ye link khulega).
- **Har Visit pe Show:** Yeh popup automatically har visit/page reload par 2.5s ke baad smooth animation ke saath open hota hai.

---

## 💰 4. Membership Plans & Pricing (`data/plans.json`)

File: `data/plans.json`

Kisi bhi plan ka price ya features badalna:
```json
{
  "id": "gold-annual",
  "name": "Annual Elite Pass",
  "price": "14,999",
  "period": "/ year",
  "durationMonths": 12,
  "isPopular": true,
  "badge": "BEST VALUE",
  "description": "Full-year transformation with free freezing and locker access.",
  "features": [
    "Full Unisex Gym Floor Access",
    "Cardio & Free Weights",
    "Complimentary Steam Room Session"
  ]
}
```

---

## 🏋️‍♂️ 5. Certified Coaches / Trainers (`data/trainers.json`)

File: `data/trainers.json`

Har coach ka card desktop par 3D Magazine Page Flip banata hai aur mobile par drawer modal:
- `"name"`: Coach ka naam.
- `"role"`: Designation (e.g. *Lead Strength Coach*).
- `"experience"`: e.g. *8+ Years Experience*.
- `"image"`: Photo URL ya path.
- `"bio"`: Description story.
- `"specialties"`: Core skills ki list `["Olympic Weightlifting", "Functional Mobility"]`.
- `"certifications"`: Accredited certificates `["ACE Certified", "CSCS Specialist"]`.
- `"socials"`: Instagram link.

---

## 💬 6. Member Reviews & Testimonials (`data/testimonials.json`)

File: `data/testimonials.json`

Review add karne ke liye:
```json
{
  "name": "Ananya Verma",
  "role": "Member • Functional Fitness",
  "avatar": "https://i.pravatar.cc/100?img=47",
  "quote": "The trainers make you feel comfortable from day one...",
  "stars": 5
}
```

---

## ❓ 7. FAQs (Frequently Asked Questions) (`data/faqs.json`)

File: `data/faqs.json`

Desktop par click-accordion banta hai aur mobile par question swipe carousel + answer drawer:
```json
{
  "question": "Is Iron Spirit Gym suitable for complete beginners?",
  "answer": "Yes! Our certified floor trainers guide you on proper lifting technique, machine setups, and safety from day one."
}
```

---

## 💡 Quick Tips & Best Practices

1. **Images Format:** Best quality aur fast loading ke liye `.webp` ya compressed `.jpg`/`.png` use karein.
2. **Videos Format:** Background videos hamesha `.mp4` format me, compressed (<15MB) aur bina audio ke best work karti hain.
3. **JSON Syntax:** Har item ke baad comma `,` lagana na bhoolein, par last item ke baad comma mat lagayein.
4. **Instant Update:** Kisi bhi JSON file me edit karke save karein aur browser refresh karein — changes turant live ho jayenge!
