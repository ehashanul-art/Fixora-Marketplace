"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";

interface HeroSlide {
  kicker: string;
  title: string;
  description: string;
  action: string;
  href: string;
  note: string;
  image: string;
  imageAlt: string;
}

const slides: HeroSlide[] = [
  {
    kicker: "Summer Sale",
    title: "Beat the Heat, Save More",
    description: "Premium split ACs at up to 30% off — free installation.",
    action: "Shop Air Conditioners",
    href: "/products",
    note: "Explore products for every space",
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&h=800&fit=crop&auto=format",
    imageAlt: "Modern air conditioner in a bright home",
  },
  {
    kicker: "Trending Now",
    title: "Build Smarter, Live Better",
    description:
      "Smart home devices, building materials, and everything in between.",
    action: "Discover Smart Home",
    href: "/categories",
    note: "Shop smarter for your home",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=800&fit=crop&auto=format",
    imageAlt: "Smart home lighting and controls",
  },
  {
    kicker: "New Launches",
    title: "Cinematic 4K Home Theatre",
    description:
      "OLED and QLED televisions for an exceptional viewing experience.",
    action: "Explore Televisions",
    href: "/products",
    note: "Discover the latest electronics",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=800&fit=crop&auto=format",
    imageAlt: "Large television in a modern living room",
  },
];

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  return (
    <section
      aria-label="Featured promotions"
      className="relative isolate grid min-h-[390px] overflow-hidden rounded-[28px] bg-blue-50 md:min-h-[420px] md:grid-cols-[1fr_0.95fr]"
    >
      <div className="relative z-10 flex flex-col items-start justify-center px-7 py-10 sm:px-10 md:px-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
          <Zap className="size-4" />
          {slide.kicker}
        </span>
        <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          {slide.title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
          {slide.description}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={slide.href}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-700 px-6 font-semibold text-white transition hover:bg-blue-800"
          >
            {slide.action}
            <ArrowRight className="size-4" />
          </Link>
          <span className="text-sm font-medium text-slate-500">{slide.note}</span>
        </div>
        <div className="mt-8 flex items-center gap-2" aria-label="Choose promotion">
          {slides.map((item, index) => (
            <button
              key={item.kicker}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${item.kicker} promotion`}
              aria-current={activeSlide === index}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-blue-700" : "w-2.5 bg-blue-200"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 -z-0 w-full md:relative md:inset-auto md:z-0 md:w-auto">
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
          className="object-cover opacity-25 md:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-50/70 to-transparent md:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-blue-50/15 to-transparent md:block" />
      </div>
    </section>
  );
}
