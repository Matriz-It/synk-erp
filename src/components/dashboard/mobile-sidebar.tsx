"use client"

import type { MeData } from "@/app/actions/auth"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  me: MeData | null
}

export function MobileSidebar({ open, onOpenChange, me }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 border-0 bg-synk-navy p-0 [&>button]:text-white">
        <VisuallyHidden>
          <SheetTitle>Navegação</SheetTitle>
        </VisuallyHidden>
        <Sidebar collapsed={false} onToggleCollapse={() => onOpenChange(false)} me={me} />
      </SheetContent>
    </Sheet>
  )
}
