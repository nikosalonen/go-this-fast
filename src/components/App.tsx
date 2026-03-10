import { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import createAppTheme from "../theme";
import ConvertView from "./ConvertView";

const THEME_STORAGE_KEY = "theme-mode";

const App: React.FC = () => {
	const [mode, setMode] = useState<"light" | "dark">("light");

	// Sync mode with what anti-FOUC script determined — runs before paint
	useLayoutEffect(() => {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === "light" || stored === "dark") {
			setMode(stored);
			return;
		}
		const htmlAttr = document.documentElement.getAttribute("data-theme");
		if (htmlAttr === "dark" || htmlAttr === "light") {
			setMode(htmlAttr);
			return;
		}
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setMode("dark");
		}
	}, []);

	const theme = useMemo(() => createAppTheme(mode), [mode]);

	// Sync data-theme attribute on <html> for Astro CSS variables
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", mode);
	}, [mode]);

	// Listen for system preference changes when no localStorage override
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem(THEME_STORAGE_KEY)) {
				setMode(e.matches ? "dark" : "light");
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const toggleMode = () => {
		const next = mode === "light" ? "dark" : "light";
		localStorage.setItem(THEME_STORAGE_KEY, next);
		setMode(next);
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					px: 2,
					pt: 1,
				}}
			>
				<IconButton
					onClick={toggleMode}
					color="inherit"
					aria-label={
						mode === "dark"
							? "Switch to light mode"
							: "Switch to dark mode"
					}
				>
					{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
				</IconButton>
			</Box>
			<ConvertView />
		</ThemeProvider>
	);
};

export default App;
