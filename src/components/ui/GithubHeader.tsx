import { useEffect, useState } from "react";
import GithubCorner from "react-github-corner";

const Header = () => {
  const [primaryColor, setPrimaryColor] = useState("#000"); // Default fallback color

  useEffect(() => {
    // Get computed styles from root (document)
    const root = getComputedStyle(document.documentElement);
    const hslColor = root.getPropertyValue("--primary").trim();

    if (hslColor) {
      setPrimaryColor(`hsl(${hslColor})`);
    }
  }, []);

  return <GithubCorner href="https://github.com/Robotics-Society-PEC/Studies" bannerColor={primaryColor} />;
};

export default Header;
