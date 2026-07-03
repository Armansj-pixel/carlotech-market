import { cookies } from "next/headers";

export function isAdminAuthed() {
  const session = cookies().get("admin_session")?.value;
  return session === process.env.ADMIN_PASSWORD;
}
