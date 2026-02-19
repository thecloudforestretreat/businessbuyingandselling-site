export async function onRequest() {
  return new Response(
    "User-agent: *\nDisallow: /\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Robots-From": "pages-function"
      }
    }
  );
}
