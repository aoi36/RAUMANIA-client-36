import { FC } from "react";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { ButtonLink } from "@/components/ButtonLink";
import { WideLogo } from "../WideLogo";
import { TallLogo } from "../TallLogo";

export type HeroProps = {
  heading: string;
  body: string;
  buttonText: string;
  buttonHref: string;
};

const Hero: FC<HeroProps> = ({ heading, body, buttonText, buttonHref }) => {
  return (
    <Bounded className="bg-brand-gray relative h-dvh overflow-hidden text-zinc-800 bg-texture">
      {/* Background logos with responsive display */}
      <div className="absolute inset-0 flex items-center">
        <WideLogo className="w-full text-brand-pink hidden opacity-10 mix-blend-multiply lg:block" />
        <TallLogo className="w-full text-brand-pink opacity-10 mix-blend-multiply lg:hidden" />
      </div>

      {/* Content container with fluid layout */}
      <div className="absolute inset-0 mx-auto mt-[max(24px,6vw)] grid max-w-6xl grid-rows-[1fr,auto] place-items-end px-6 ~py-10/16">
        <Heading className="relative max-w-2xl place-self-start ~text-4xl/7xl">
          {heading}
        </Heading>

        <div className="flex relative w-full flex-col items-center justify-between ~gap-2/4 lg:flex-row">
          <div className="max-w-[45ch] ~text-lg/xl">
            <p>{body}</p>
          </div>

          <ButtonLink
            href={buttonHref}
            icon="GiDelicatePerfume"
            size="lg"
            className="z-20 mt-2 block"
          >
            {buttonText}
          </ButtonLink>
        </div>
      </div>
    </Bounded>
  );
};

export default Hero;
