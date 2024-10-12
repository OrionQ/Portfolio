"use client";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
const ThemeSwitcher = () => {
  const [mount, setMount] = useState(false);
  const {systemTheme, theme, setTheme} = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  useEffect(() => {
    setMount(true);
  }, []);
  return mount ? (
    <div className="">
      <button onClick={() => setTheme("system")}>System</button>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  ) : null;
};
export default ThemeSwitcher;
