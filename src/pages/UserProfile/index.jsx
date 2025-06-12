import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { ProfileUpload } from "./userProfile-uploadbtn"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/auth"
import { useNavigate } from "react-router-dom"
import { PasswordInput } from "@/components/ui/passwordInput"
import { getInicials } from "@/lib/utils"
import { api } from "@/services/api"
import { LiveActionButton } from "@/components/live-action-button"


export function UserProfile() {

    const { signOut, user, updateProfile } = useAuth()
    const navigate = useNavigate()

    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [passwordOld, setPasswordOld] = useState()
    const [passwordNew, setPasswordNew] = useState()
    const [bio, setBio] = useState(user.bio)

    const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/avatar/${user.avatar}`
    : ""
    const [avatar, setAvatar] = useState(avatarUrl)
    const [avatarFile, setAvatarFile] = useState(null) 

    const initials = getInicials(name)

    async function handleUpdate(e) {
        e.preventDefault()
        const updated = {
            name, 
            email,
            password: passwordNew,
            old_password: passwordOld
        }

        const userUpdated = Object.assign(user, updated)
        await updateProfile({user: userUpdated, avatarFile})
    }

    const handleSignOut = (e) => {
        e.preventDefault()
        signOut()
        navigate("/");
    }

    const handleChangeAvatar = (file) => {
        setAvatarFile(file)
        console.log(file)
        const imagePreview = URL.createObjectURL(file)
        setAvatar(imagePreview)
    }

    return(
        <div className="bg-white sm:ml-[270px] font-inter ">
            <Sidebar/>
            <main className="">
                <header className="hidden sm:flex sm:justify-end sm:gap-3 sm:items-center  border-b py-6 px-8 ">
                    <LiveActionButton/>
                    <Button className="h-11 w-[130px] rounded-[16px] bg-[#5E56FF]">Sincronizar</Button>
                </header>

 
                <form onSubmit={handleUpdate} className="w-full mx-auto max-w-[1000px] pt-6">

                    <h2 className="text-lg font-medium mb-6">Personal Information</h2>

                    <div className="border-b pb-6 mb-6 flex justify-between items-center">

                        <div className="w-full">
                            <h3>Seu avatar</h3>
                            <p className="text-gray-600">Escolha sua melhor foto</p>
                        </div>


                        <div className="flex gap-6 w-full items-center">
                            <Avatar className="size-20">
                                <AvatarImage src={avatar}/>
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>

                            <ProfileUpload onFileChange={handleChangeAvatar}/>
                        </div>
                    </div>


                    <div className="flex justify-between ">
                        <div className="w-full">
                            <h3>Nome de Exibição</h3>
                            <p className="text-gray-600">Nome que irá aparecer no seu perfil</p>
                        </div>

                        <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)}/>
                    </div>

                    <div className="flex justify-between pt-4">
                        <div className="w-full">
                            <h3>Email de Usuário</h3>
                            <p className="text-gray-600">As pessoas pesquisarão sua conta com esse</p>
                        </div>

                        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>

                    <div className="flex justify-between pt-4">
                        <div className="">
                            <h3>Senha de Usuário Atual</h3>
                            <p className="text-gray-600">Altere sua senha aqui</p>
                        </div>

                        <PasswordInput 
                            id="password"
                            value={passwordOld}
                            className="w-[508px]"
                            onChange={e => setPasswordOld(e.target.value)}
                            placeholder="******"
                        />
                    </div>
                    <div className="flex justify-between pt-4">
                        <div className="">
                            <h3>Nova Senha</h3>
                            <p className="text-gray-600">Altere sua senha aqui</p>
                        </div>

                        <PasswordInput className="w-[508px]" placeholder="Senha Nova" onChange={e => setPasswordNew(e.target.value)} value={passwordNew}/>
                    </div>

                    <div className="flex justify-between pt-4 pb-6">
                        <div className="w-full">
                            <h3>Bio</h3>
                            <p className="text-gray-600">Escreva um pouco sobre você</p>
                        </div>

                        <Textarea placeholder="Bio" className="resize-none" value={bio} onChange={e => setBio(e.target.value)}/>
                    </div>
                    

                    <div className="w-full flex justify-between">

                        <Button onClick={handleSignOut} className="w-full max-w-44 bg-[#FD3E3E]/20 hover:bg-[#FD3E3E]/30 border border-[#FD3E3E]/50 text-[#FD3E3E]">
                            Sair
                        </Button>

                        <Button type="submit" className="w-full max-w-44 bg-[#5E56FF]" onClick={handleUpdate}>
                            Save Changes
                        </Button>


                    </div>

                </form>



            </main>
        </div>
    )
}