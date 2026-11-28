
import Banner from "@/components/banner";
import FeaturedMenu from "@/components/featured-menu";
import PizzaCategories from "@/components/pizza-categories";
import WhyChoosePizzaHub from "@/components/why-choose-pizzahub";
import HowItWorks from "@/components/how-it-works";

export default function Home() {
  return (
    <>
      <Banner />
      <FeaturedMenu />
      <PizzaCategories />
      <HowItWorks />
      <WhyChoosePizzaHub />
    </>
  );
}