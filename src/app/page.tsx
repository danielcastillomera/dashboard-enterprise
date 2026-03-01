import { redirect } from "next/navigation";

export default function Home() {
  // En el futuro, verificar si el usuario está autenticado
  // Si no lo está, redirigir a /login
  // Si lo está, redirigir a /panel
  redirect("/panel");
}
