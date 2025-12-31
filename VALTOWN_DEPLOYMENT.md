# Val.town Deployment Guide

## ✅ Option 1: GitHub Fetch (Fixed)

Create a new **HTTP Val** and use this code:

```typescript
export default async function(req: Request): Promise<Response> {
  const html = await fetch(
    'https://raw.githubusercontent.com/cori/FPV-configurator/claude/fpv-quad-builder-1qodR/index.html'
  ).then(r => r.text());

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
```

**Key fix**: Added proper TypeScript types and made sure we're calling `.text()` on the response.

---

## 📦 Option 2: Self-Contained (Recommended for Val.town)

This is actually **easier** and more reliable for val.town:

1. Create a new **HTTP Val**
2. Copy this entire code block:

```typescript
export default async function(req: Request): Promise<Response> {
  return new Response(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FPV Quad Build Validator</title>
  <!-- PASTE THE REST OF index.html HERE -->
</html>
`;
```

3. **Replace the HTML constant** with the full contents of `index.html`

---

## 🚀 Option 3: Quick Copy-Paste (Easiest!)

Since you have the file locally, here's the fastest method:

1. Open `index.html`
2. Copy **everything** (Ctrl+A, Ctrl+C)
3. Go to val.town, create new HTTP val
4. Paste this wrapper:

```typescript
export default async function(req: Request): Promise<Response> {
  return new Response(`
<!-- PASTE YOUR ENTIRE index.html HERE -->
`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

5. Replace the comment with your copied HTML
6. Save!

---

## 🔍 Why Option 1 Failed

Val.town was trying to **import** the GitHub URL as a JavaScript module instead of fetching it as text. The fixed version with proper async/await and `.text()` should work, but **Option 2 or 3 is more reliable** since there's no external dependency.

---

## ✅ Testing Your Deployment

After deploying, test:
- Navigate to your val's URL
- Select: 5" frame + 2306 motors + 1750KV + 6S
- Should see: ✅ Build looks good!
- Try wizard mode toggle
- Canvas should show quad diagram

---

## 💡 My Recommendation

Use **Option 3** (quick copy-paste) - it's the simplest and most reliable for val.town!
