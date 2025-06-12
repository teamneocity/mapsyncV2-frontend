"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"

export function Notifications() {
  return (
    <div className="bg-white sm:ml-[270px] font-inter">
        <Sidebar/>


        <header className="hidden sm:flex sm:justify-end sm:gap-3 sm:items-center  border-b py-6 px-8 ">
                <p className="font-medium text-[#5E56FF]">Mapping Sync</p>
                <Button className="h-11 w-[130px] rounded-[16px] bg-[#5E56FF]">Sincronizar</Button>
        </header>
        <main className="min-h-[calc(100vh-100px)] grid place-items-center">

            
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="space-y-8">
                    {/* Row 1 */}
                    <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-8">
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Notificações por e-mail</Label>
                        <p className="text-sm text-muted-foreground">Mantenha-se informado e conectado com nossas notificações</p>
                    </div>
                    <Switch  className="data-[state=checked]:bg-[#5E56FF]"/>
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Atualização de ocorrências</Label>
                        <p className="text-sm text-muted-foreground">
                        Atualizações importantes personalizadas especialmente para você
                        </p>
                    </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-8">
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Notificações no app</Label>
                        <p className="text-sm text-muted-foreground">Mantenha-se informado e conectado com nossas notificações</p>
                    </div>
                    <Switch  className="data-[state=checked]:bg-[#5E56FF]"/>
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Atualização de ocorrências</Label>
                        <p className="text-sm text-muted-foreground">
                        Atualizações importantes personalizadas especialmente para você
                        </p>
                    </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-8">
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Notificações de mensagens</Label>
                        <p className="text-sm text-muted-foreground">
                        Fique por dentro de mensagens e atualizações importantes personalizadas especialmente para você
                        </p>
                    </div>
                    <Switch  className="data-[state=checked]:bg-[#5E56FF]"/>
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Atualização de ocorrências</Label>
                        <p className="text-sm text-muted-foreground">
                        Atualizações importantes personalizadas especialmente para você
                        </p>
                    </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}

