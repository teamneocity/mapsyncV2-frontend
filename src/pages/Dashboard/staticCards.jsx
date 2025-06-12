
import { ShieldPlus, CirclePlay} from "lucide-react"

export function StaticCards() {
    return(
        <div className="flex flex-col gap-2">
                        

            <div className="xl:min-w-[400px] max-w-[500px] 2xl:min-w-[600px] 2xl:w-full shadow-[0px_1px_2px_0px_#EAEAEA] py-3 px-5 rounded-[8px] flex gap-[20px] border items-center h-22 max-sm:max-w-[350px]">
                <div className="size-12 bg-[#F7F7F7] rounded-full flex items-center justify-center text-gray-700 max-2xl:bg-white">
                    <ShieldPlus/>
                </div>

                <div className="">
                    <p className="text-xl">Convite</p>
                    <p className="text-[14px] max-w-[500px] text-gray-700">Impulsione seu sistema e comece a convidar seu time para colaborar. E sinta se a vontade.</p>
                </div>
            </div>

            <div className="xl:min-w-[400px] max-w-[500px] 2xl:min-w-[600px] 2xl:w-full shadow-[0px_1px_2px_0px_#EAEAEA] py-3 px-5 rounded-[8px] flex gap-[20px] border items-center mt-[50px] h-22 max-sm:max-w-[350px]">
                <div className="size-12 bg-[#F7F7F7] rounded-full flex items-center justify-center text-gray-700 max-2xl:bg-white">
                    <CirclePlay/>
                </div>

                <div className="">
                    <p className="text-xl">Tutoriais</p>
                    <p className="text-[14px] max-w-[500px] text-gray-700">Explore o sistema passo a passo ou entre em contato com o suporte para lhe ajudar.</p>
                </div>
            </div>
            
    </div>
    )
}