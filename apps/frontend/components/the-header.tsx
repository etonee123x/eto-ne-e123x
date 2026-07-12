
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import React from "react";

export default function TheHeader({ }: React.HTMLProps<HTMLDivElement>) {
  return <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuLink
          render={<Link href="/" />}
          className={navigationMenuTriggerStyle()}
        >
          Home
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          render={<Link href="/explorer" />}
          className={navigationMenuTriggerStyle()}
        >
          Content
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          render={<Link href="/blog" />}
          className={navigationMenuTriggerStyle()}
        >
          Blog
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
}