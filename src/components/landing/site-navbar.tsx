"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function SiteNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <span className="logo">Synk</span>

      <ul className="nav-links">
        <li>
          <a href="#features">Produto</a>
        </li>
        <li>
          <a href="#features">Funcionalidades</a>
        </li>
        <li>
          <a href="#pricing">Preços</a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
      </ul>

      <div className="nav-actions">
        <Link href="/login" className="btn-ghost">
          Entrar
        </Link>
        <Link href="/signup" className="btn-primary">
          Começar grátis
        </Link>
      </div>

      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="nav-mobile-menu">
          <a href="#features" onClick={() => setOpen(false)}>
            Produto
          </a>
          <a href="#features" onClick={() => setOpen(false)}>
            Funcionalidades
          </a>
          <a href="#pricing" onClick={() => setOpen(false)}>
            Preços
          </a>
          <a href="#" onClick={() => setOpen(false)}>
            Blog
          </a>
          <div className="nav-mobile-actions">
            <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)}>
              Entrar
            </Link>
            <Link href="/signup" className="btn-primary" onClick={() => setOpen(false)}>
              Começar grátis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
