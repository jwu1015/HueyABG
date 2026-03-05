import { Chat } from "@/components/Chat";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            HuyABG
          </Link>
          <nav className="site-nav">
            <Link href="/">Home</Link>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <section className="hero">
          <div className="hero-inner">
            <h1 className="hero-title">Hi, I&apos;m Huy</h1>
            <p className="hero-subtitle">
              Let me show you how to rizz up ABGs.
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="content-inner">
            <Chat />
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <p>HuyABG · Built with Next.js</p>
          </div>
        </footer>
      </main>
    </>
  );
}
