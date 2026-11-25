"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/drawer";

/**
 * Висувна скляна панель «Нова операція» (DESIGN.md §5, §6.1).
 * Поки що заглушка: форма витрати, доходу й переказу — день 15 roadmap.
 */
export function NewOperationDrawer({ trigger }: { trigger: ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-lg rounded-t-sheet! border-glass-border bg-glass-strong shadow-glass glass-blur-strong">
        <DrawerHeader className="relative px-5 pt-3 pb-2 text-left!">
          <DrawerTitle className="text-xl/7 font-bold">Нова операція</DrawerTitle>
          <DrawerDescription className="text-[13px]/[18px] font-medium">
            Витрата, дохід або переказ
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Закрити"
              className="absolute top-1 right-3 size-11 pressable rounded-full"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="rounded-card bg-card p-5 text-muted-foreground shadow-card">
            Форма внесення операції зʼявиться на тижні 3.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
