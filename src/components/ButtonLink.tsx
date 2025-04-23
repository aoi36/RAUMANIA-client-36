// Fix the TypeScript error by properly typing the href prop
import { FaCartShopping, FaPlus } from "react-icons/fa6"
import { GiDelicatePerfume } from "react-icons/gi"
import clsx from "clsx"
import Link from "next/link"
import type { ComponentProps } from "react"

export type ButtonProps = {
  color?: "orange" | "purple" | "lime"
  size?: "sm" | "md" | "lg"
  icon?: "cart" | "GiDelicatePerfume" | "plus"
} & Omit<ComponentProps<typeof Link>, "href"> & {
    href: string
  }

export function ButtonLink({ color = "orange", size = "md", icon, children, className, ...props }: ButtonProps) {
  const icons = {
    cart: <FaCartShopping />,
    plus: <FaPlus />,
    GiDelicatePerfume: <GiDelicatePerfume />,
  }

  return (
    <Link
      className={clsx(
        "button-cutout group mx-4 inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom",
        size === "sm" && "~gap-2/3 ~py-1.5/2.5 ~text-xs/base",
        size === "md" && "~gap-3/4 ~px-1/2 ~py-2/3 ~text-base/lg",
        size === "lg" && "~text-lg/xl ~gap-3/5 ~px-2/3 ~py-2.5/4",
        color === "orange" && "from-brand-orange to-brand-lime text-black hover:text-black",
        color === "purple" && "from-brand-purple to-brand-lime text-white hover:text-black",
        color === "lime" && "from-brand-lime to-brand-orange text-black hover:text-black",
        className,
      )}
      {...props}
    >
      {icon && (
        <>
          <div
            className={clsx(
              "flex items-center justify-center transition-transform group-hover:-rotate-[25deg] [&>svg]:h-full [&>svg]:w-full",
              size === "sm" && "~size-4/5",
              size === "md" && "~size-5/6",
              size === "lg" && "~size-6/8",
            )}
          >
            {icons[icon]}
          </div>
          <div className="w-px self-stretch bg-black/25" />
        </>
      )}
      {children}
    </Link>
  )
}
