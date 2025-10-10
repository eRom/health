import { Footer } from "@/components/navigation/footer";
import { Header } from "@/components/navigation/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pl-8 pr-8">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
