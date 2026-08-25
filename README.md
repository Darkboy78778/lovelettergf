# 💌 Love Letter

### Turn a message into a moment worth remembering.

Love Letter is a digital gifting experience designed to transform ordinary messages into personalized, interactive moments.

Create a gift, personalize the experience, add music and animations, then share it through a unique link.

---

## ✨ Features

- 💌 Personalized messages
- 🎁 Interactive digital gifts
- 🎵 Background music
- ✨ Animated transitions
- 🖼️ Personalized content
- 🔗 Unique shareable links
- 📱 Responsive design
- 🔐 Private gift access

---

## 👨‍💻 About Me

I'm **Nexora**, a developer and digital creator interested in building modern websites, useful digital tools, and creative web experiences.

I enjoy turning ideas into functional products and experimenting with different technologies, interfaces, and user experiences.

---

## 🧩 How It Works

Each gift is accessed through a unique URL:

```text
/gift/{gift-id}
```

The application reads the gift ID from the URL and loads the corresponding content.

```tsx
const { id } = useParams<{ id: string }>();

const gift = await getGift(id);

if (!gift) {
  return <NotFound />;
}
```

---

## 🔗 Shareable Gifts

Every created gift receives its own unique link:

```tsx
const giftUrl = `${window.location.origin}/gift/${gift.id}`;

navigator.clipboard.writeText(giftUrl);
```

This allows a gift to be shared directly with its recipient.

---

## 🎵 Interactive Experience

The gift experience supports background music and interactive controls:

```tsx
const [isPlaying, setIsPlaying] = useState(false);

const toggleMusic = () => {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }

  setIsPlaying(!isPlaying);
};
```

---

## 🛠️ Technology

```text
React
TypeScript
Vite
Tailwind CSS
Supabase
```

### Architecture

```text
                    User
                      │
                      ▼
              React Application
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     Gift Creation  Gift Viewer  Sharing
          │           │           │
          └───────────┼───────────┘
                      ▼
                   Supabase
                      │
                      ▼
                  Gift Data
```

---

## 🎯 Vision

> **Make digital messages feel less digital.**

The idea behind Love Letter is simple: a meaningful message can be more than text on a screen. It can become an experience that someone can open, explore, and remember.

---

## 🚀 Project Status

**Active project**

The project is continuously being improved with new ideas, interactions, and features.

---

## 📌 Creator

**Nexora**

Building websites, digital tools, and creative web experiences.

---

### © 2026 Nexora
