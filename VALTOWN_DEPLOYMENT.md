# Val.town Deployment Guide

## ✅ Working Solution: String Concatenation

Use this approach which **doesn't use template literals**:

```typescript
export default async function(req: Request): Promise<Response> {
  return new Response(HTML_CONTENT, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FPV Quad Build Validator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    /* PASTE ALL CSS HERE - ESCAPE ANY BACKTICKS BY REPLACING \` WITH \\` */
  </style>
</head>
<body>
  <!-- PASTE ALL HTML BODY HERE -->

  <script>
    // PASTE ALL JAVASCRIPT HERE
    // Important: Replace all backticks (`) with escaped version (\\`)
  </script>
</body>
</html>
`.replace(/\\\`/g, '`'); // This unescapes the backticks at runtime
```

### Step-by-Step:

1. Copy your `index.html`
2. Find and replace all backticks: **Find** `` ` `` → **Replace** `\\\`` (that's backslash-backslash-backtick)
3. Paste the modified HTML into the `HTML_CONTENT` template literal
4. The `.replace(/\\\`/g, '`')` at the end will restore the backticks at runtime

---

## 🚀 Even Easier: Base64 Encoding

Or just encode the whole thing:

```typescript
export default async function(req: Request): Promise<Response> {
  // Base64 encoded HTML (no backtick issues!)
  const base64Html = "<!-- PASTE BASE64 HERE -->";

  const html = atob(base64Html);

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

To generate the base64:

```bash
# In your terminal:
cat index.html | base64 -w 0 > encoded.txt

# Then copy the contents of encoded.txt into the base64Html variable
```

---

## 🎯 Simplest: GitHub Raw Fetch (Fixed Version)

Actually, let's fix the original approach properly:

```typescript
export default async function(req: Request): Promise<Response> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/cori/FPV-configurator/claude/fpv-quad-builder-1qodR/index.html'
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    return new Response(`Error loading validator: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
```

This version:
- Has proper error handling
- Returns error messages if fetch fails
- Adds caching to reduce GitHub requests
- Should work on val.town

---

## 💡 My Recommendation

Try the **GitHub Raw Fetch** version above first - it's the cleanest and should work now with proper async/await handling. If that still fails, use the **Base64 encoding** method which is guaranteed to work with no escaping needed!
