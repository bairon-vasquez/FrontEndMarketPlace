"use client"

import type React from "react"

import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Save, ArrowLeft, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/providers/store-provider"
import { usersApi } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { state, login } = useStore()
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: state.user?.name || "",
    email: state.user?.email || "",
  })

  const [profileAddresses, setProfileAddresses] = useState<any[]>(() => {
    try {
      return Array.isArray(state.user?.direcciones) ? state.user?.direcciones : []
    } catch {
      return []
    }
  })

  // keep profileAddresses in sync when the user in the store changes (e.g. after login)
  useEffect(() => {
    try {
      setProfileAddresses(Array.isArray(state.user?.direcciones) ? state.user?.direcciones : [])
    } catch {
      // ignore
    }
  }, [state.user])

  const addEmptyAddress = () => {
    setProfileAddresses((s) => [
      ...s,
      { idDireccion: 0, pais: "", ciudad: "", direccion: "", tipo: "", idUsuario: state.user?.id ?? null },
    ])
  }

  const updateAddress = (index: number, patch: Record<string, any>) => {
    setProfileAddresses((s) => s.map((a, i) => (i === index ? { ...a, ...patch } : a)))
  }

  const removeAddress = (index: number) => {
    setProfileAddresses((s) => s.filter((_, i) => i !== index))
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  if (!state.isAuthenticated) {
    router.push("/login")
    return null
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userId = state.user?.id
      if (!userId) throw new Error("Usuario no autenticado")

      const payload: Record<string, any> = {}
      if (profileData.name) payload.nombre = profileData.name
      if (profileData.email) payload.email = profileData.email

      const res = await usersApi.update(userId, payload)
      const raw = res?.user ?? res

      const mapped = {
        id: Number(raw?.idUsuario ?? raw?.id ?? raw?._id ?? state.user?.id ?? 0),
        email: raw?.email ?? raw?.correo ?? profileData.email,
        name: raw?.nombre ?? raw?.name ?? profileData.name,
         role: (raw?.role ?? raw?.rol ?? state.user?.role ?? "user") as "user" | "admin",
         direcciones: raw?.direcciones ?? profileAddresses ?? state.user?.direcciones ?? [],
      }

      login(mapped)
      toast.success("Perfil actualizado correctamente")
    } catch {
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const userId = state.user?.id
      if (!userId) throw new Error("Usuario no autenticado")

      // Call dedicated password-change endpoint which requires current + new + confirm
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }
      const res = await usersApi.changePassword(userId, payload)
      // If backend returns updated user, update store
      const raw = res?.user ?? res
      if (raw) {
        const mapped = {
          id: Number(raw?.idUsuario ?? raw?.id ?? raw?._id ?? state.user?.id ?? 0),
          email: raw?.email ?? raw?.correo ?? state.user?.email,
          name: raw?.nombre ?? raw?.name ?? state.user?.name,
           role: (raw?.role ?? raw?.rol ?? state.user?.role ?? "user") as "user" | "admin",
           direcciones: raw?.direcciones ?? profileAddresses ?? state.user?.direcciones ?? [],
        }
        login(mapped)
      }
      toast.success("Contraseña actualizada correctamente")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch {
      toast.error("Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y seguridad</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="addresses">Direcciones</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>Actualiza tu nombre y correo electrónico</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="pl-10"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Rol:</strong> {state.user?.role === "admin" ? "Administrador" : "Usuario"}
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Mis Direcciones
                </CardTitle>
                <CardDescription>Gestiona tus direcciones de envío</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileAddresses.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay direcciones registradas.</p>
                  )}

                  {profileAddresses.map((addr, idx) => (
                    <div key={idx} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">{addr.tipo || `Dirección ${idx + 1}`}</div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => removeAddress(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Input value={addr.tipo || ""} onChange={(e) => updateAddress(idx, { tipo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Dirección</Label>
                          <Input value={addr.direccion || ""} onChange={(e) => updateAddress(idx, { direccion: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Ciudad</Label>
                            <Input value={addr.ciudad || ""} onChange={(e) => updateAddress(idx, { ciudad: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>País</Label>
                            <Input value={addr.pais || ""} onChange={(e) => updateAddress(idx, { pais: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button type="button" onClick={addEmptyAddress}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar dirección
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        setIsLoading(true)
                        try {
                          const userId = state.user?.id
                          if (!userId) throw new Error("Usuario no autenticado")
                          const res = await usersApi.update(userId, { direcciones: profileAddresses })
                          const raw = res?.user ?? res
                          if (raw) {
                            const mapped = {
                              id: Number(raw?.idUsuario ?? raw?.id ?? raw?._id ?? state.user?.id ?? 0),
                              email: raw?.email ?? raw?.correo ?? state.user?.email,
                              name: raw?.nombre ?? raw?.name ?? state.user?.name,
                               role: (raw?.role ?? raw?.rol ?? state.user?.role ?? "user") as "user" | "admin",
                               direcciones: raw?.direcciones ?? state.user?.direcciones ?? [],
                            }
                            login(mapped)
                          }
                          toast.success("Direcciones guardadas correctamente")
                        } catch (err) {
                          console.error(err)
                          toast.error("Error al guardar direcciones")
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                    >
                      Guardar direcciones
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>Asegúrate de usar una contraseña segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    <Lock className="mr-2 h-4 w-4" />
                    {isLoading ? "Actualizando..." : "Cambiar Contraseña"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
