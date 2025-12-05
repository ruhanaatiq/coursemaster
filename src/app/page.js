"use client";

import Hero from "@/components/Hero";
import InstructorSpotlight from "@/components/InstructorSpotlight";
import Testimonials from "@/components/Testimonials";
import Image from "next/image";

export default function Home() {
  return (
    <>  <Hero/>
    <InstructorSpotlight/>
    <Testimonials/>
    </>
   
  );
}
