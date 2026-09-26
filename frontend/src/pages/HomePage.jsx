import React from "react";
import ContactBand from "../components/home/ContactBand";
import Hero from "../components/home/Hero";
import Process from "../components/home/Process";
import SelectedWork from "../components/home/SelectedWork";
import ServiceMarquee from "../components/home/ServiceMarquee";
import ServicesBento from "../components/home/ServicesBento";
import TrustRow from "../components/home/TrustRow";
import PageTransition from "../components/layout/PageTransition";
import Seo from "../components/layout/Seo";

export default function HomePage() {
  return <PageTransition><Seo title="KAVINHQ" description="Kavin designs and builds fast, search-ready websites, e-commerce stores and custom web experiences."/><main><Hero/><ServiceMarquee/><SelectedWork/><ServicesBento/><Process/><TrustRow/><ContactBand/></main></PageTransition>;
}
