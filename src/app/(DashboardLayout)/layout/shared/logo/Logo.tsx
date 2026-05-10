"use client";

import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  display: "block",
  lineHeight: 0,
}));

const LOGO_W = 100;
const LOGO_H = 90;

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image
        src="/images/logos/logo.png"
        alt="ClientPilot"
        width={LOGO_W}
        height={LOGO_H}
        sizes={`${LOGO_W}px`}
        priority
      />
    </LinkStyled>
  );
};

export default Logo;
