# Val.town Deployment Guide

## Option 1: Quick Deploy (Recommended)

1. Go to [Val.town](https://val.town) and create a new **HTTP Val**
2. Copy the code below into your val:

```javascript
export default async function(req) {
  // Read the HTML file from the repository
  const html = await fetch('https://raw.githubusercontent.com/cori/FPV-configurator/claude/fpv-quad-builder-1qodR/index.html')
    .then(r => r.text());

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
```

3. Save and your build validator is live!

**Note**: This fetches from GitHub, so update the branch name to `main` after merging your PR.

---

## Option 2: Self-Contained Val (No External Dependencies)

If you want the HTML embedded directly in the val (doesn't depend on GitHub):

1. Go to [Val.town](https://val.town) and create a new **HTTP Val**
2. Use this template structure:

```javascript
export default async function(req) {
  const html = `<!DOCTYPE html>
<html lang="en">
<!-- PASTE THE ENTIRE CONTENTS OF index.html HERE -->
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
```

3. **Copy the entire contents** of `index.html` and paste it inside the backticks (template literal)
4. **Important**: Make sure there are no backticks (`) in the HTML that would break the template literal
   - Our HTML doesn't have any, so you're good!
5. Save and deploy

---

## Option 3: Using Val.town Blob Storage

For the most efficient approach using val.town's blob storage:

```javascript
import { blob } from "https://esm.town/v/std/blob";

export default async function(req) {
  // First time: Store the HTML
  // await blob.setJSON("fpv-validator-html", "<PASTE_HTML_HERE>");

  // Then use this:
  const html = await blob.getJSON("fpv-validator-html");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
```

---

## Verification

After deploying, test these features:
- ✅ Select 5" frame + 2306 motors + 1750KV + 6S → Should show valid build
- ✅ Select 7" frame + 1404 motors → Should show error
- ✅ Enable wizard mode → Motor dropdown should filter
- ✅ Canvas should draw quad with force vectors
- ✅ Mobile responsive (test on phone)

---

## Custom Domain (Optional)

Val.town gives you a URL like: `https://username-valname.web.val.run`

To use a custom domain:
1. Upgrade to Val.town Pro
2. Go to your val settings
3. Add your custom domain
4. Update DNS records as instructed

---

## Updating After Changes

**Option 1 (GitHub fetch)**:
- Just push updates to GitHub
- Val auto-fetches latest on each request

**Option 2 (Self-contained)**:
- Replace the HTML in your val
- Save to redeploy

**Option 3 (Blob storage)**:
- Run the `setJSON` line again with updated HTML
- Comment it out after

---

## Performance Notes

- **Initial Load**: ~40KB (loads instantly)
- **No external dependencies**: Everything is inline
- **Caching**: Add cache headers if needed:

```javascript
return new Response(html, {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=3600", // 1 hour
  },
});
```

---

## Troubleshooting

**Val shows blank page**:
- Check browser console for errors
- Verify HTML is valid (no unclosed tags)
- Ensure template literal backticks are escaped

**Wizard mode not working**:
- Check JavaScript console
- Verify all script tags are included
- Make sure event listeners are attached

**Canvas not showing**:
- Verify `<canvas>` element exists
- Check if `getContext('2d')` is available
- Test in different browsers

---

**Pro Tip**: Use Option 1 (GitHub fetch) during development, then switch to Option 2 (self-contained) for production to avoid GitHub dependency.
