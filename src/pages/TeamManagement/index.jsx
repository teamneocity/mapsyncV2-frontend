
"use client"

import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/auth"
import { useToast } from "@/hooks/use-toast"
import { getInicials } from "@/lib/utils"
import { api } from "@/services/api"
import { useEffect, useState } from "react"

export function TeamManagement() {
  const { user } = useAuth()
  const userInitials = getInicials(user.name)
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    sector: "EMURB",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("todos")

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filterRole]) // Atualiza a lista quando a página, o termo de busca ou  filtro mudam
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm, // Adiciona o termo de busca
          role: filterRole === "todos" ? "" : filterRole, // Adiciona o filtro de cargo
        },
      })

      console.log("Resposta da API:", response.data) // Verifique os dados retornados

      if (response.data.data) {
        setUsers(response.data.data)
        setTotalPages(Math.ceil(response.data.total / itemsPerPage))
      } else {
        setUsers(response.data)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error) // Verifique erros
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Todos os campos são obrigatórios!",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não batem!",
      })
      return
    }

    try {
      const response = await api.post("/users", formData)

      setFormData({
        name: "",
        role: "",
        sector: "EMURB",
        email: "",
        password: "",
        confirmPassword: "",
      })

      toast({
        description: "Usuário Criado com sucesso!",
      })

      fetchUsers()
    } catch (error) {
      if (error.response) {
        toast({
          variant: "destructive",
          title: error.response.data.error,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Não foi possível Atualizar o perfil.",
          description: "Teve um problema na sua requisição.",
        })
      }
    }
  }

  const handleDelete = async () => {
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "O campo de email é obrigatório!",
      })
      return
    }

    try {
      const response = await api.delete(`/users`, { params: { email: formData.email } })

      setFormData({
        name: "",
        role: "",
        sector: "EMURB",
        email: "",
        password: "",
        confirmPassword: "",
      })

      toast({
        description: "Usuário Inativado com sucesso!",
      })

      fetchUsers()
    } catch (error) {
      if (error.response) {
        console.log(error)
      } else {
        toast({
          variant: "destructive",
          title: "Não foi possível Atualizar o perfil.",
          description: "Teve um problema na sua requisição.",
        })
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearchTerm = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "todos" ? true : user.role === filterRole
    return matchesSearchTerm && matchesRole
  })

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-background flex flex-col sm:ml-[270px] font-inter">
      <Sidebar></Sidebar>

      <main className="container py-8 px-3">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Gestão de Equipes</h1>
          <p className="text-sm text-muted-foreground">Organize suas métricas de acordo com sua necessidade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`${api.defaults.baseURL}/avatar/${user.avatar}`} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Cargo: {user.role}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Lista de Usuários</h3>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Buscar por nome"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="pilotoa">Piloto Drone</SelectItem>
                    <SelectItem value="pilotot">Motociclista</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchUsers}>Buscar</Button>
              </div>
              <div className="w-full">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <p>Carregando usuários...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
                {!loading && users.length > 0 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome completo</label>
                <Input placeholder="Digite o nome" value={formData.name} onChange={handleChange("name")} required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Nível do usuário</label>
                <Select value={formData.role} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="pilotoa">Piloto Drone</SelectItem>
                    <SelectItem value="pilotot">Motociclista</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">E-mail</label>
                <Input placeholder="Digite o email " value={formData.email} onChange={handleChange("email")} required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Senha</label>
                <Input type="password" value={formData.password} onChange={handleChange("password")} required />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Confirmar senha</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="bg-[#FFF5F5] text-[#FD3E3E]" onClick={handleDelete}>Deletar</Button>
              <Button className="bg-[#003DF6]" onClick={handleSubmit}>
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



// "use client"

// import { Sidebar } from "@/components/sidebar"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { useAuth } from "@/hooks/auth"
// import { useToast } from "@/hooks/use-toast"
// import { getInicials } from "@/lib/utils"
// import { api } from "@/services/api"
// import { useEffect, useState } from "react"

// export function TeamManagement() {
//   const { user } = useAuth()
//   const userInitials = getInicials(user.name)
//   const { toast } = useToast()
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)

//   const [formData, setFormData] = useState({
//     name: "",
//     role: "analyst",
//     sector: "EMURB",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   })

//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage] = useState(5)
//   const [totalPages, setTotalPages] = useState(1)

//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterRole, setFilterRole] = useState("todos")

//   useEffect(() => {
//     fetchUsers()
//   }, [currentPage, searchTerm, filterRole])

//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       const response = await api.get("/users/paginated", {
//         params: {
//           page: currentPage,
//           perPage: itemsPerPage,
//           search: searchTerm,
//           role: filterRole === "todos" ? null : filterRole,
//         },
//       })

//       setUsers(response.data.users)
//       setTotalPages(response.data.totalPages)
//     } catch (error) {
//       console.error("Erro ao buscar usuários:", error)
//       toast({
//         variant: "destructive",
//         title: error.response?.data?.message || "Erro ao carregar usuários",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleChange = (field) => (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: e.target.value,
//     }))
//   }

//   const handleSelectChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       role: value,
//     }))
//   }

//   const handleSubmit = async () => {
//     if (formData.password !== formData.confirmPassword) {
//       toast({
//         variant: "destructive",
//         title: "As senhas não coincidem!",
//       })
//       return
//     }

//     try {
//       const userData = {
//         full_name: formData.name,
//         email: formData.email,
//         role: formData.role,
//         sector: formData.sector,
//         password: formData.password,
//         password_confirmation: formData.confirmPassword
//       }

//       await api.post("/auth/register", userData)

//       setFormData({
//         name: "",
//         role: "analyst",
//         sector: "EMURB",
//         email: "",
//         password: "",
//         confirmPassword: "",
//       })

//       toast({ description: "Usuário criado com sucesso!" })
//       fetchUsers()
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: error.response?.data?.errors?.[0] || "Erro na criação do usuário",
//       })
//     }
//   }

//   const handleDelete = async () => {
//     if (!formData.email) {
//       toast({
//         variant: "destructive",
//         title: "Digite o email do usuário para excluir",
//       })
//       return
//     }

//     try {
//       await api.delete(`/users/${formData.email}`)

//       setFormData({
//         name: "",
//         role: "analyst",
//         sector: "EMURB",
//         email: "",
//         password: "",
//         confirmPassword: "",
//       })

//       toast({ description: "Usuário inativado com sucesso!" })
//       fetchUsers()
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: error.response?.data?.message || "Erro ao excluir usuário",
//       })
//     }
//   }

//   const translateRole = (role) => {
//     const roles = {
//       'analyst': 'Analista',
//       'operator': 'Operador',
//       'supervisor': 'Supervisor',
//       'drone_pilot': 'Piloto Drone',
//       'motorcyclist': 'Motociclista',
//       'manager': 'Gestor'
//     }
//     return roles[role] || role
//   }

//   return (
//     <div className="min-h-screen bg-background flex flex-col sm:ml-[270px] font-inter">
//       <Sidebar />

//       <main className="container py-8 px-3">
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold mb-2">Gestão de Equipes</h1>
//           <p className="text-sm text-muted-foreground">Organize suas métricas de acordo com sua necessidade</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="space-y-6">
//             <Card className="p-6">
//               <div className="flex items-center gap-4 mb-4">
//                 <Avatar className="w-16 h-16">
//                   <AvatarImage src={`${api.defaults.baseURL}/avatar/${user.avatar}`} />
//                   <AvatarFallback>{userInitials}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h2 className="text-xl font-semibold">{user.name}</h2>
//                   <p className="text-sm text-muted-foreground">{user.email}</p>
//                   <p className="text-sm text-muted-foreground">Cargo: {translateRole(user.role)}</p>
//                 </div>
//               </div>
//             </Card>

//             <Card className="p-6">
//               <h3 className="font-semibold mb-4">Lista de Usuários</h3>
//               <div className="flex gap-4 mb-4">
//                 <Input
//                   placeholder="Buscar por nome"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="flex-1"
//                 />
//                 <Select value={filterRole} onValueChange={setFilterRole}>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Filtrar por cargo" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="todos">Todos</SelectItem>
//                     <SelectItem value="analyst">Analista</SelectItem>
//                     <SelectItem value="operator">Operador</SelectItem>
//                     <SelectItem value="supervisor">Supervisor</SelectItem>
//                     <SelectItem value="drone_pilot">Piloto Drone</SelectItem>
//                     <SelectItem value="motorcyclist">Motociclista</SelectItem>
//                     <SelectItem value="manager">Gestor</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button onClick={fetchUsers}>Buscar</Button>
//               </div>

//               <div className="w-full">
//                 {loading ? (
//                   <div className="flex justify-center py-4">
//                     <p>Carregando usuários...</p>
//                   </div>
//                 ) : (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Nome</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Cargo</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {users.length > 0 ? (
//                         users.map((user) => (
//                           <TableRow key={user.uuid}>
//                             <TableCell className="font-medium">{user.full_name}</TableCell>
//                             <TableCell>{user.email}</TableCell>
//                             <TableCell>{translateRole(user.role)}</TableCell>
//                           </TableRow>
//                         ))
//                       ) : (
//                         <TableRow>
//                           <TableCell colSpan={3} className="text-center py-4">
//                             Nenhum usuário encontrado
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 )}

//                 {!loading && users.length > 0 && (
//                   <div className="flex items-center justify-between space-x-2 py-4">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
//                       disabled={currentPage === 1}
//                     >
//                       Anterior
//                     </Button>
//                     <div className="text-sm text-muted-foreground">
//                       Página {currentPage} de {totalPages}
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                     >
//                       Próxima
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-6">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Nome completo</label>
//                 <Input
//                   placeholder="Digite o nome"
//                   value={formData.name}
//                   onChange={handleChange("name")}
//                   required
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Nível do usuário</label>
//                 <Select value={formData.role} onValueChange={handleSelectChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Selecione o nível" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="analyst">Analista</SelectItem>
//                     <SelectItem value="operator">Operador</SelectItem>
//                     <SelectItem value="supervisor">Supervisor</SelectItem>
//                     <SelectItem value="drone_pilot">Piloto Drone</SelectItem>
//                     <SelectItem value="motorcyclist">Motociclista</SelectItem>
//                     <SelectItem value="manager">Gestor</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">E-mail</label>
//                 <Input
//                   type="email"
//                   placeholder="Digite o email"
//                   value={formData.email}
//                   onChange={handleChange("email")}
//                   required
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Senha</label>
//                 <Input
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange("password")}
//                   required
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Confirmar senha</label>
//                 <Input
//                   type="password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange("confirmPassword")}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col gap-2">
//               <Button
//                 className="bg-[#FFF5F5] text-[#FD3E3E] hover:bg-red-100"
//                 onClick={handleDelete}
//               >
//                 Deletar
//               </Button>
//               <Button
//                 className="bg-[#003DF6] hover:bg-blue-700"
//                 onClick={handleSubmit}
//               >
//                 Cadastrar
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
