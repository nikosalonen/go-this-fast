import type React from "react";
import { type ChangeEvent, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import RunEstimates from "./RunEstimates";
import type { TimeInput } from "./RunEstimates";

const ConvertView: React.FC = () => {
	const [values, setValues] = useState({
		minPerKm: { minutes: "0", seconds: "00" },
		minPerMile: { minutes: "0", seconds: "00" },
		kmPerHour: "",
		milesPerHour: "",
	});

	const [times, setTimes] = useState<Record<string, TimeInput>>({
		"100m": { hours: 0, minutes: 0, seconds: 0 },
		"400m": { hours: 0, minutes: 0, seconds: 0 },
		"1km": { hours: 0, minutes: 0, seconds: 0 },
		"1mile": { hours: 0, minutes: 0, seconds: 0 },
		"5km": { hours: 0, minutes: 0, seconds: 0 },
		"10km": { hours: 0, minutes: 0, seconds: 0 },
		"Half Marathon": { hours: 0, minutes: 0, seconds: 0 },
		Marathon: { hours: 0, minutes: 0, seconds: 0 },
	});

	const formatToPaceObj = (totalMinutes: number) => {
		const minutes = Math.floor(totalMinutes);
		const seconds = Math.round((totalMinutes - minutes) * 60);
		return {
			minutes: minutes.toString(),
			seconds: seconds.toString().padStart(2, "0"),
		};
	};

	const parseMinSec = (value: string): number => {
		const [minutes, seconds = "0"] = value.split(":");
		if (seconds.length > 2 || Number(seconds) > 59) {
			throw new Error("Invalid seconds");
		}
		return Number(minutes) + Number(seconds) / 60;
	};

	const calculateEstimates = (paceMinutes?: number, paceSeconds?: number) => {
		const minutes = paceMinutes ?? Number(values.minPerKm.minutes);
		const seconds = paceSeconds ?? Number(values.minPerKm.seconds);

		const paceInSeconds = minutes * 60 + seconds;

		const newTimes = { ...times };

		const distances = {
			"100m": 0.1,
			"400m": 0.4,
			"1km": 1,
			"1mile": 1.60934,
			"5km": 5,
			"10km": 10,
			"Half Marathon": 21.0975,
			Marathon: 42.195,
		};

		for (const [distance, km] of Object.entries(distances)) {
			const totalSeconds = paceInSeconds * km;
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = Math.floor(totalSeconds % 60);

			newTimes[distance] = { hours, minutes, seconds };
		}

		return newTimes;
	};

	const generateOptions = (min: number, max: number, padZero = false) => {
		return Array.from({ length: max - min + 1 }, (_, i) => {
			const value = (i + min).toString();
			return padZero ? value.padStart(2, "0") : value;
		});
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
		(field: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) => {
			let newValue = e.target.value;

			if (field === "minPerKm" || field === "minPerMile") {
				if (!/^[\d]*:?[\d]*$/.test(newValue)) return;

				const newValues = { ...values, [field]: newValue };

				if (!newValue.includes(":") || newValue.endsWith(":")) {
					setValues(newValues);
					return;
				}

				try {
					const numValue = parseMinSec(newValue);

					switch (field) {
						case "minPerKm":
							newValues.kmPerHour = (60 / numValue).toFixed(1);
							newValues.minPerMile = formatToPaceObj(numValue * 1.60934);
							newValues.milesPerHour = (37.282272 / numValue).toFixed(1);
							break;
						case "minPerMile":
							newValues.kmPerHour = (96.56064 / numValue).toFixed(1);
							newValues.minPerKm = formatToPaceObj(numValue / 1.60934);
							newValues.milesPerHour = (60 / numValue).toFixed(1);
							break;
					}

					if (field === "minPerKm") {
						setTimes(
							calculateEstimates(
								Number(newValues.minPerKm.minutes),
								Number(newValues.minPerKm.seconds),
							),
						);
					}
					setValues(newValues);
				} catch (error) {
					setValues(newValues);
				}
			} else {
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
						default:
							setValues(newValues);
					}
				}
			}
		};

	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		setTimes((prev) => {
			const newTimes = {
				...prev,
				[distance]: {
					...prev[distance],
					[field]: value === "" ? "" : Number(value),
				},
			};

			const time = newTimes[distance];
			const totalSeconds =
				(Number(time.hours) || 0) * 3600 +
				(Number(time.minutes) || 0) * 60 +
				(Number(time.seconds) || 0);

			const distanceMatch = distance.match(/(\d+(?:\.\d+)?)/);
			const distanceKm = distanceMatch
				? Number.parseFloat(distanceMatch[1])
				: null;

			if (distanceKm && totalSeconds > 0) {
				const paceMinPerKm = totalSeconds / (60 * distanceKm);
				const minutes = Math.floor(paceMinPerKm);
				const seconds = Math.round((paceMinPerKm - minutes) * 60);

				const kmPerHour = (distanceKm * 3600) / totalSeconds;
				const milesPerHour = kmPerHour / 1.60934;
				const paceMinPerMile = paceMinPerKm * 1.60934;
				const mileMinutes = Math.floor(paceMinPerMile);
				const mileSeconds = Math.round((paceMinPerMile - mileMinutes) * 60);

				setValues((prev) => ({
					...prev,
					minPerKm: {
						minutes: minutes.toString(),
						seconds: seconds.toString().padStart(2, "0"),
					},
					minPerMile: {
						minutes: mileMinutes.toString(),
						seconds: mileSeconds.toString().padStart(2, "0"),
					},
					kmPerHour: kmPerHour.toFixed(1),
					milesPerHour: milesPerHour.toFixed(1),
				}));
			}

			return newTimes;
		});
	};

	return (
		<>
			<Card sx={{ maxWidth: 448, mx: "auto" }}>
				<CardContent sx={{ p: 3 }}>
					<Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
						Pace/Speed Converter
					</Typography>

					<Stack spacing={3}>
						{/* Kilometer metrics */}
						<Stack spacing={2}>
							<Typography variant="subtitle1" fontWeight={600} color="text.secondary">
								Kilometers
							</Typography>
							<Box>
								<Typography variant="body2" color="text.secondary" mb={0.5}>
									Pace (min/km)
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<FormControl size="small" sx={{ minWidth: 80 }}>
										<Select
											value={values.minPerKm.minutes}
											onChange={(e) =>
												handlePaceChange("minPerKm", "minutes", e.target.value)
											}
										>
											{generateOptions(0, 20).map((value) => (
												<MenuItem key={value} value={value}>
													{value}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<Typography>:</Typography>
									<FormControl size="small" sx={{ minWidth: 80 }}>
										<Select
											value={values.minPerKm.seconds}
											onChange={(e) =>
												handlePaceChange("minPerKm", "seconds", e.target.value)
											}
										>
											{generateOptions(0, 59, true).map((value) => (
												<MenuItem key={value} value={value}>
													{value}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Stack>
							</Box>

							<TextField
								label="Kilometers per Hour"
								type="number"
								size="small"
								value={values.kmPerHour}
								onChange={handleChange("kmPerHour")}
								placeholder="0.0"
								fullWidth
							/>
						</Stack>

						{/* Mile metrics */}
						<Stack spacing={2}>
							<Typography variant="subtitle1" fontWeight={600} color="text.secondary">
								Miles
							</Typography>
							<Box>
								<Typography variant="body2" color="text.secondary" mb={0.5}>
									Pace (min/mile)
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<FormControl size="small" sx={{ minWidth: 80 }}>
										<Select
											value={values.minPerMile.minutes}
											onChange={(e) =>
												handlePaceChange("minPerMile", "minutes", e.target.value)
											}
										>
											{generateOptions(0, 30).map((value) => (
												<MenuItem key={value} value={value}>
													{value}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<Typography>:</Typography>
									<FormControl size="small" sx={{ minWidth: 80 }}>
										<Select
											value={values.minPerMile.seconds}
											onChange={(e) =>
												handlePaceChange("minPerMile", "seconds", e.target.value)
											}
										>
											{generateOptions(0, 59, true).map((value) => (
												<MenuItem key={value} value={value}>
													{value}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Stack>
							</Box>

							<TextField
								label="Miles per Hour"
								type="number"
								size="small"
								value={values.milesPerHour}
								onChange={handleChange("milesPerHour")}
								placeholder="0.0"
								fullWidth
							/>
						</Stack>
					</Stack>
				</CardContent>
			</Card>
			<RunEstimates
				times={times}
				onTimeChange={handleTimeChange}
				onPaceChange={(_distance, pacePerKm) => {
					const minutes = Math.floor(pacePerKm / 60);
					const seconds = Math.round(pacePerKm % 60);
					setValues((prev) => ({
						...prev,
						minPerKm: {
							minutes: minutes.toString(),
							seconds: seconds.toString().padStart(2, "0"),
						},
					}));
				}}
				onSpeedChange={(_distance, speedKmH) => {
					setValues((prev) => ({
						...prev,
						kmPerHour: speedKmH.toFixed(2),
					}));
				}}
			/>
		</>
	);
};

export default ConvertView;
