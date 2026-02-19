export async function onRequest() {
  return new Response(
    "User-agent: *\nDisallow: /\n",
    {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store"
      }
    }
  );
}
