import { Header } from "@/components/Header";
import Hero from "@/components/home/Hero";
import TextAndImage from "@/components/home/TextAndImage/TextAndImage";
import VideoBlock from "@/components/home/VideoBlock/videoblock";

import { heroData, productsData, textAndImageSlices } from "./data/homeData";
import { TextAndImageProps } from "@/components/home/TextAndImage/TextAndImage";
import Footer from "@/components/Footer";
import { InteractivePerfume } from "@/components/home/InteractivePerfume";
import ProductGrid from "@/components/ProductGrid/ProductGrid";


type TextAndImageBundle = {
  slice_type: "text_and_image_bundle";
  slices: TextAndImageProps[];
};

export default function Home() {
  const bundledSlices = bundleTextAndImageSlices(textAndImageSlices);

  return (
    <>
      <Header />

      <div className="relative">
        <InteractivePerfume />

      <Hero
        heading={heroData.heading}
        body={heroData.body}
        buttonText={heroData.buttonText}
        buttonHref={heroData.buttonHref}
        color={heroData.color}
      />
      </div>

      <ProductGrid
        heading="Our Perfumes"
        body="Browse our luxurious collection of signature scents."
        products={productsData}
      />

      {bundledSlices.map((slice, index) => {
        if ("slice_type" in slice && slice.slice_type === "text_and_image_bundle") {
          return (
            <div key={index}>
              {slice.slices.map((s, i) => (
                <TextAndImage key={i} {...s} />
              ))}
            </div>
          );
        }

        
      })}

      <VideoBlock youtubeID="VllN0yINA5A" />

      <Footer/>
    </>
  );
}

function bundleTextAndImageSlices(
  slices: TextAndImageProps[]
): (TextAndImageProps | TextAndImageBundle)[] {
  const res: (TextAndImageProps | TextAndImageBundle)[] = [];

  for (const slice of slices) {
    const last = res.at(-1);
    if (last && "slice_type" in last && last.slice_type === "text_and_image_bundle") {
      last.slices.push(slice);
    } else {
      res.push({
        slice_type: "text_and_image_bundle",
        slices: [slice],
      });
    }
  }

  return res;
}
