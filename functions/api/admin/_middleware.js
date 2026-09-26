import { adminGuard } from "../../_lib/auth.js";

export async function onRequest(context) {
  const blocked = await adminGuard(context);
  if (blocked) return blocked;
  return context.next();
}
