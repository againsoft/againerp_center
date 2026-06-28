import { redirect } from "next/navigation";

/** Legacy route — monitoring replaces direct DB connection UI (architecture rule). */
export default function CenterDatabasesRedirectPage() {
  redirect("/center/monitoring");
}
