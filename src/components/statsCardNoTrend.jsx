import { ChartNoAxesColumn } from "lucide-react"
import graphUp from "../assets/graphup.svg"
import graphDown from "../assets/graphdown.svg"
import { useState, useEffect } from "react";
import { useSpring,animated } from "react-spring";



function AnimatedNumber({ n }) {
    const { number } = useSpring({
        from: { number: 0 },
        number: n,
        delay: 200,
        config: { mass: 1, tension: 20, friction: 10 },
    });


    const formatNumber = (num) => {

        const integerNum = Math.floor(num); 

        return integerNum.toLocaleString('pt-BR');
    };

    return <animated.div>{number.to((n) => formatNumber(Math.floor(n)))}</animated.div>;
}


export function StatsCardNoTrend({text, number }) {

    
    return(
        <div className="w-full h-[150px] border max-sm:max-w-[350px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] rounded-[8px] p-2">
            <div className="border h-[88px] rounded-[8px] p-4 flex justify-between">
                <div>
                    <p className="text-gray-700">{text}</p>
                    <div className="flex gap-2 items-center">
                        <div className="text-gray-900 text-2xl mt-2"><AnimatedNumber n={number}/></div>
                        {/* <div className={`px-2 ${status ? "bg-[#5E56FF]" : "bg-[#FD3E3E]"} rounded-full max-h-5 flex items-center text-white`}>
                            {statistics}%
                        </div> */}
                    </div>
                    
                </div>
                
                <div className="size-10  border shadow-[0px_1px_2px_0px_#EAEAEA] rounded-[8px] flex items-center justify-center">
                    <ChartNoAxesColumn />
                </div>
            </div>

            {/* <div className="mt-2 h-10 flex items-center ">
                {status ? (
                    <div className="flex text-[#5E56FF]  ">
                        <img src={graphUp} alt="" />
                        <p>+{statistics}%</p>
                    </div>
                
                ) : (
                    <div className="flex text-[#FD3E3E]">
                        <img src={graphDown} alt="" className="size-6"/>
                        <p>{statistics}%</p>
                    </div>
                )}
                
                <p className="text-sm text-gray-600 ml-5">Do mês passado</p>
            </div> */}
        </div>
    )
}