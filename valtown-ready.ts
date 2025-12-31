// Ready-to-use Val.town HTTP handler
// Just copy this entire file into a new val.town HTTP val

export default async function(req: Request): Promise<Response> {
  const base64Html = `EOF
cat /home/user/FPV-configurator/index.html.base64 >> /home/user/FPV-configurator/valtown-ready.ts
cat >> /home/user/FPV-configurator/valtown-ready.ts << 'EOF'
`;

  const html = atob(base64Html);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
