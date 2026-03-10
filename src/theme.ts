import { createTheme } from "@mui/material/styles";

const createAppTheme = (mode: "light" | "dark") =>
	createTheme({
		palette: {
			mode,
			primary: {
				main: "#4f46e5",
			},
			secondary: {
				main: "#3b82f6",
			},
			...(mode === "light"
				? { background: { default: "#f9fafb" } }
				: {}),
		},
		typography: {
			fontFamily: "'Inter', sans-serif",
		},
		breakpoints: {
			values: {
				xs: 0,
				sm: 640,
				md: 768,
				lg: 1024,
				xl: 1280,
			},
		},
	});

export default createAppTheme;
