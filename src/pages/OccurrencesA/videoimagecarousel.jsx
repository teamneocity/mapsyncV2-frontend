"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function OccurrenceView({ occurrence }) {
  // Carousel state
  const [api, setApi] = useState(null)
  const [current, setCurrent] = useState(0)

  console.log("OccurrenceView", occurrence)

  // Handle carousel navigation
  useEffect(() => {
    if (!api) {
      return
    }

    const setSlide = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", setSlide)
    return () => {
      api.off("select", setSlide)
    }
  }, [api])

  return (
    <div className="h-[500px] rounded-lg flex justify-between gap-2 ml-5">
      {/* Carousel replacing the video */}
      <Carousel className="overflow-hidden w-full h-full min-w-[600px]" setApi={setApi}>
        <CarouselContent className="h-full">
          {/* Image slide */}
          <CarouselItem className="h-full">
            <div className="h-full w-full flex items-center justify-center">
              <img
                src={`https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.photo_air_occcurrences[0].path}`}
                alt={occurrence.description || "Occurrence image"}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          </CarouselItem>

          {/* Video slide */}
          <CarouselItem className="h-full">
            <div className="h-full w-full flex items-center justify-center">
              <video controls className="object-cover w-full h-full rounded-lg">
                <source
                  src={`https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.videos[0]?.path}`}
                  type="video/mp4"
                />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          </CarouselItem>
        </CarouselContent>

        {/* Navigation arrows */}
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />

        {/* Indicator dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {[0, 1].map((index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${current === index ? "bg-white" : "bg-white/50"}`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}

