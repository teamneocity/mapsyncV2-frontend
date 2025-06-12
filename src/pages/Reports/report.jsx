export function Report({id, date, adress}) {
    return(
        <div className="bg-[#EBEBEB] p-3 flex flex-col rounded-[16px] justify-center items-center max-w-64 gap-4 font-inter">
            <img src="https://i.ibb.co/F4tyt9Lf/408347-mais-buraco-do-que-rua-2-2-800x519.png" alt="" className="w-full h-auto object-cover rounded-t-[14px]"/>

            <div className="flex flex-col  w-full text-[#787891] font-semibold">
                <div className="border-b py-3" >ID: <span className="font-normal">{id}</span></div>
                <div className="border-b py-3">Data: <span className="font-normal">{date}</span></div>
                <div className="pt-3 pb-5">Endereço : <span className="font-normal">{adress}</span></div>
            </div>
        </div>
    )
}