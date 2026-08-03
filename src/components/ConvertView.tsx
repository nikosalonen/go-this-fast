import type React from "react";
import { type ChangeEvent, useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import RunEstimates from "./RunEstimates";
import type { TimeInput } from "./RunEstimates";

const CUSTOM_DISTANCES_KEY = "customDistances";

const HARDCODED_DISTANCES: Record<string, number> = {
	"100m": 0.1,
	"400m": 0.4,
	"1km": 1,
	"1mile": 1.60934,
	"5km": 5,
	"10km": 10,
	"Half Marathon": 21.0975,
	Marathon: 42.195,
};

const ConvertView: React.FC = () => {
	const [values, setValues] = useState({
		minPerKm: { minutes: "0", seconds: "00" },
		minPerMile: { minutes: "0", seconds: "00" },
		kmPerHour: "",
		milesPerHour: "",
	});

	const [customDistances, setCustomDistances] = useState<Record<string, number>>({});
	const [storageLoaded, setStorageLoaded] = useState(false);

	const [times, setTimes] = useState<Record<string, TimeInput>>(() =>
		Object.fromEntries(
			Object.keys(HARDCODED_DISTANCES).map((label) => [
				label,
				{ hours: 0, minutes: 0, seconds: 0 },
			]),
		),
	);

	// localStorage is unavailable while server-rendering, so saved distances have to be
	// applied after mount — reading them during the first render breaks hydration
	useEffect(() => {
		try {
			const saved = localStorage.getItem(CUSTOM_DISTANCES_KEY);
			if (saved) {
				const custom: Record<string, number> = JSON.parse(saved);
				setCustomDistances(custom);
				setTimes((prev) => {
					const next = { ...prev };
					for (const label of Object.keys(custom)) {
						next[label] ??= { hours: 0, minutes: 0, seconds: 0 };
					}
					return next;
				});
			}
		} catch { /* ignore malformed storage */ }
		setStorageLoaded(true);
	}, []);

	const formatToPaceObj = (totalMinutes: number) => {
		const minutes = Math.floor(totalMinutes);
		const seconds = Math.round((totalMinutes - minutes) * 60);
		return {
			minutes: minutes.toString(),
			seconds: seconds.toString().padStart(2, "0"),
		};
	};

	const calculateEstimates = (paceMinutes?: number, paceSeconds?: number, extraCustomDistances?: Record<string, number>) => {
		const mins = paceMinutes ?? Number(values.minPerKm.minutes);
		const secs = paceSeconds ?? Number(values.minPerKm.seconds);

		const paceInSeconds = mins * 60 + secs;

		const newTimes = { ...times };

		const allDistances = { ...HARDCODED_DISTANCES, ...(extraCustomDistances ?? customDistances) };

		for (const [distance, km] of Object.entries(allDistances)) {
			const totalSeconds = paceInSeconds * km;
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = Math.floor(totalSeconds % 60);

			newTimes[distance] = { hours, minutes, seconds };
		}

		return newTimes;
	};

	// Guarded so the empty initial state can't overwrite saved distances before they load
	useEffect(() => {
		if (!storageLoaded) return;
		localStorage.setItem(CUSTOM_DISTANCES_KEY, JSON.stringify(customDistances));
	}, [customDistances, storageLoaded]);

	const handleAddCustomDistance = (label: string, km: number) => {
		const newCustomDistances = { ...customDistances, [label]: km };
		setCustomDistances(newCustomDistances);

		const paceInSeconds =
			Number(values.minPerKm.minutes) * 60 + Number(values.minPerKm.seconds);
		const totalSeconds = paceInSeconds * km;
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = Math.floor(totalSeconds % 60);

		setTimes((prev) => ({
			...prev,
			[label]: { hours, minutes, seconds },
		}));
	};

	const formatSliderLabel = (value: number) => {
		const m = Math.floor(value / 60);
		const s = value % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	const sliderMarks = Array.from({ length: 15 }, (_, i) => ({
		value: (i + 1) * 60,
		label: `${i + 1}`,
	}));

	const paceSliderValue =
		Number(values.minPerKm.minutes) * 60 + Number(values.minPerKm.seconds);

	const handleSliderChange = (_event: Event, value: number | number[]) => {
		const totalSeconds = value as number;
		const minutes = Math.floor(totalSeconds / 60).toString();
		const seconds = (totalSeconds % 60).toString().padStart(2, "0");

		const numValue = Number(minutes) + Number(seconds) / 60;
		const newValues = {
			...values,
			minPerKm: { minutes, seconds },
			kmPerHour: (60 / numValue).toFixed(1),
			minPerMile: formatToPaceObj(numValue * 1.60934),
			milesPerHour: (37.282272 / numValue).toFixed(1),
		};
		setValues(newValues);
		setTimes(calculateEstimates(Number(minutes), Number(seconds)));
	};

	const handlePaceChange = (
		field: "minPerKm" | "minPerMile",
		type: "minutes" | "seconds",
		value: string,
	) => {
		const newValues = {
			...values,
			[field]: { ...values[field], [type]: value },
		};

		const numValue =
			Number(newValues[field].minutes) + Number(newValues[field].seconds) / 60;

		switch (field) {
			case "minPerKm":
				newValues.kmPerHour = (60 / numValue).toFixed(1);
				newValues.minPerMile = formatToPaceObj(numValue * 1.60934);
				newValues.milesPerHour = (37.282272 / numValue).toFixed(1);
				setTimes(
					calculateEstimates(
						Number(newValues.minPerKm.minutes),
						Number(newValues.minPerKm.seconds),
					),
				);
				break;
			case "minPerMile":
				newValues.kmPerHour = (96.56064 / numValue).toFixed(1);
				newValues.minPerKm = formatToPaceObj(numValue / 1.60934);
				newValues.milesPerHour = (60 / numValue).toFixed(1);
				setTimes(
					calculateEstimates(
						Number(newValues.minPerKm.minutes),
						Number(newValues.minPerKm.seconds),
					),
				);
				break;
		}

		setValues(newValues);
	};

	const handleChange =
		(field: "kmPerHour" | "milesPerHour") =>
		(e: ChangeEvent<HTMLInputElement>) => {
			let newValue = e.target.value;
			newValue = newValue.replace(",", ".");

			if (newValue === "" || newValue === "." || newValue === ",") {
				setValues({ ...values, [field]: newValue });
				return;
			}

			const numValue = Number.parseFloat(newValue);

			if (!Number.isNaN(numValue)) {
				const newValues = { ...values, [field]: newValue };

				switch (field) {
					case "kmPerHour": {
						const minPerKmObj = formatToPaceObj(60 / numValue);
						newValues.minPerKm = minPerKmObj;
						newValues.minPerMile = formatToPaceObj(96.56064 / numValue);
						newValues.milesPerHour = (numValue / 1.60934).toFixed(1);
						setValues(newValues);
						setTimes(
							calculateEstimates(
								Number(minPerKmObj.minutes),
								Number(minPerKmObj.seconds),
							),
						);
						break;
					}
					case "milesPerHour": {
						const kmPerHour = numValue * 1.60934;
						const minPerKmObjFromMph = formatToPaceObj(60 / kmPerHour);
						newValues.minPerKm = minPerKmObjFromMph;
						newValues.minPerMile = formatToPaceObj(60 / numValue);
						newValues.kmPerHour = kmPerHour.toFixed(1);
						setValues(newValues);
						setTimes(
							calculateEstimates(
								Number(minPerKmObjFromMph.minutes),
								Number(minPerKmObjFromMph.seconds),
							),
						);
						break;
					}
				}
			}
		};

	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		setTimes((prev) => ({
			...prev,
			[distance]: {
				...prev[distance],
				[field]: value === "" ? "" : Number(value),
			},
		}));
	};

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 420px) minmax(0, 1fr)" },
				alignItems: "start",
				gap: 3,
				px: { xs: 2, sm: 0 },
			}}
		>
			<Card sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
				<CardContent sx={{ p: 3 }}>
					<Typography
						component="h1"
						variant="h5"
						sx={{ fontWeight: "bold", mb: 3, color: "text.primary" }}
					>
						Pace/Speed Converter
					</Typography>

					<Stack spacing={3}>
						{/* One shared pace control; both unit sections below read from it */}
						<Box>
							<Typography
								component="h2"
								variant="subtitle1"
								sx={{ fontWeight: 600, color: "text.secondary" }}
							>
								Pace
							</Typography>
							<Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
								Drag to set (min/km)
							</Typography>
							<Box sx={{ px: 1 }}>
								<Slider
									value={paceSliderValue}
									onChange={handleSliderChange}
									min={60}
									max={900}
									step={1}
									marks={sliderMarks}
									valueLabelDisplay="auto"
									valueLabelFormat={formatSliderLabel}
									aria-label="Pace in minutes per kilometer"
								/>
							</Box>
						</Box>

						{/* Kilometer metrics */}
						<Stack spacing={2}>
							<Typography
								component="h2"
								variant="subtitle1"
								sx={{ fontWeight: 600, color: "text.secondary" }}
							>
								Kilometers
							</Typography>
							<Box>
								<Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
									Pace (min/km)
								</Typography>
								<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
									<TextField
										label="Min"
										type="number"
										sx={{ width: 100 }}
										value={values.minPerKm.minutes}
										onChange={(e) =>
											handlePaceChange("minPerKm", "minutes", e.target.value)
										}
										slotProps={{
											htmlInput: { min: 0, max: 20, style: { textAlign: "center" } }
										}}
									/>
									<Typography variant="h6">:</Typography>
									<TextField
										label="Sec"
										type="number"
										sx={{ width: 100 }}
										value={values.minPerKm.seconds}
										onChange={(e) =>
											handlePaceChange("minPerKm", "seconds", e.target.value)
										}
										slotProps={{
											htmlInput: { min: 0, max: 59, style: { textAlign: "center" } }
										}}
									/>
								</Stack>
							</Box>

							<TextField
								label="Kilometers per Hour"
								value={values.kmPerHour}
								onChange={handleChange("kmPerHour")}
								placeholder="0.0"
								fullWidth
								slotProps={{ htmlInput: { inputMode: "decimal" } }}
							/>
						</Stack>

						{/* Mile metrics */}
						<Stack spacing={2}>
							<Typography
								component="h2"
								variant="subtitle1"
								sx={{ fontWeight: 600, color: "text.secondary" }}
							>
								Miles
							</Typography>
							<Box>
								<Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
									Pace (min/mile)
								</Typography>
								<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
									<TextField
										label="Min"
										type="number"
										sx={{ width: 100 }}
										value={values.minPerMile.minutes}
										onChange={(e) =>
											handlePaceChange("minPerMile", "minutes", e.target.value)
										}
										slotProps={{
											htmlInput: { min: 0, max: 30, style: { textAlign: "center" } }
										}}
									/>
									<Typography variant="h6">:</Typography>
									<TextField
										label="Sec"
										type="number"
										sx={{ width: 100 }}
										value={values.minPerMile.seconds}
										onChange={(e) =>
											handlePaceChange("minPerMile", "seconds", e.target.value)
										}
										slotProps={{
											htmlInput: { min: 0, max: 59, style: { textAlign: "center" } }
										}}
									/>
								</Stack>
							</Box>

							<TextField
								label="Miles per Hour"
								value={values.milesPerHour}
								onChange={handleChange("milesPerHour")}
								placeholder="0.0"
								fullWidth
								slotProps={{ htmlInput: { inputMode: "decimal" } }}
							/>
						</Stack>
					</Stack>
				</CardContent>
			</Card>
			<RunEstimates
				times={times}
				onTimeChange={handleTimeChange}
				customDistances={customDistances}
				onAddCustomDistance={handleAddCustomDistance}
				onPaceChange={(_distance, pacePerKm) => {
					const paceMinPerKm = pacePerKm / 60;
					const kmPerHour = 3600 / pacePerKm;
					setValues({
						minPerKm: formatToPaceObj(paceMinPerKm),
						minPerMile: formatToPaceObj(paceMinPerKm * 1.60934),
						kmPerHour: kmPerHour.toFixed(1),
						milesPerHour: (kmPerHour / 1.60934).toFixed(1),
					});
				}}
			/>
		</Box>
	);
};

export default ConvertView;
