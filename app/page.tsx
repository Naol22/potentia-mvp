"use client";
// import AboutComponent from "@/components/AboutComponent";
import Hero from "@/components/Hero";
// import MiningSolutions from "@/components/Solutions";
import Head from "@/components/Head"
import HashrateAdSection from "@/components/HashrateAdSection";
// import MiningJourney from "@/components/MiningJourney";
import AfricanMiningJourney from "@/components/AfricanMiningJourney";
import BitcoinDiplomacy from "@/components/BitcoinDiplomacy";

export default function HomePage() {
  return (
    <>
    <Head/>
     <Hero/>
     <HashrateAdSection/>
     {/* <AboutComponent/>
     <MiningJourney/> */}
      <AfricanMiningJourney />
     <BitcoinDiplomacy />
    </>
  );
}
