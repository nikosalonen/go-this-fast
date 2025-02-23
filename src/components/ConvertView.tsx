import type React from "react";
import { type ChangeEvent, useState } from "react";
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

	// Add helper functions for time conversions
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
		// Validate that seconds are between 0-59
		if (seconds.length > 2 || Number(seconds) > 59) {
			throw new Error("Invalid seconds");
		}
		return Number(minutes) + Number(seconds) / 60;
	};

	// Calculate estimated times based on current pace
	const calculateEstimates = () => {
		if (!values.minPerKm.minutes || !values.minPerKm.seconds) return times;

		const paceInSeconds =
			parseMinSec(`${values.minPerKm.minutes}:${values.minPerKm.seconds}`) * 60; // Convert minutes to seconds
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

	// Helper function to generate options for dropdowns with customizable ranges
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

		// Convert pace to numeric value for calculations
		const numValue =
			Number(newValues[field].minutes) + Number(newValues[field].seconds) / 60;

		if (numValue > 0) {
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
				setTimes(calculateEstimates());
			}
		}
		setValues(newValues);
	};

	// Update handleChange to handle MM:SS format
	const handleChange =
		(field: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) => {
			let newValue = e.target.value;

			if (field === "minPerKm" || field === "minPerMile") {
				// Allow only digits and a single colon for time inputs
				if (!/^[\d]*:?[\d]*$/.test(newValue)) return;

				const newValues = { ...values, [field]: newValue };

				// Only attempt calculations if we have a valid MM:SS format
				if (!newValue.includes(":") || newValue.endsWith(":")) {
					setValues(newValues);
					return;
				}

				try {
					const numValue = parseMinSec(newValue);

					if (numValue > 0) {
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
							setTimes(calculateEstimates());
						}
					}
					setValues(newValues);
				} catch (error) {
					setValues(newValues);
				}
			} else {
				// Handle speed inputs (kmPerHour and milesPerHour)
				// Replace comma with period for decimal numbers
				newValue = newValue.replace(",", ".");

				// Allow empty or partial decimal input
				if (newValue === "" || newValue === "." || newValue === ",") {
					setValues({ ...values, [field]: newValue });
					return;
				}

				const numValue = Number.parseFloat(newValue);

				if (!Number.isNaN(numValue)) {
					const newValues = { ...values, [field]: newValue };

					if (numValue > 0) {
						switch (field) {
							case "kmPerHour":
								newValues.minPerKm = formatToPaceObj(60 / numValue);
								newValues.minPerMile = formatToPaceObj(96.56064 / numValue);
								newValues.milesPerHour = (numValue / 1.60934).toFixed(1);
								break;
							case "milesPerHour":
								newValues.minPerKm = formatToPaceObj(37.282272 / numValue);
								newValues.minPerMile = formatToPaceObj(60 / numValue);
								newValues.kmPerHour = (numValue * 1.60934).toFixed(1);
								break;
						}
					}
					setValues(newValues);
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
		<>
			<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
				<h2 className="text-2xl font-bold mb-6 text-gray-800">
					Pace/Speed Converter
				</h2>

				<div className="space-y-6">
					{/* Kilometer metrics */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-700">Kilometers</h3>
						<div className="flex flex-col">
							<label
								htmlFor="minPerKm"
								className="text-sm font-medium text-gray-600 mb-1"
							>
								Pace (min/km)
							</label>
							<div id="minPerKm" className="flex gap-2 items-center">
								<select
									value={values.minPerKm.minutes}
									onChange={(e) =>
										handlePaceChange("minPerKm", "minutes", e.target.value)
									}
									className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{generateOptions(2, 20).map((value) => (
										<option key={value} value={value}>
											{value}
										</option>
									))}
								</select>
								<span>:</span>
								<select
									value={values.minPerKm.seconds}
									onChange={(e) =>
										handlePaceChange("minPerKm", "seconds", e.target.value)
									}
									className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{generateOptions(0, 59, true).map((value) => (
										<option key={value} value={value}>
											{value}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex flex-col">
							<label
								htmlFor="kmPerHour"
								className="text-sm font-medium text-gray-600 mb-1"
							>
								Kilometers per Hour
							</label>
							<input
								id="kmPerHour"
								type="number"
								value={values.kmPerHour}
								onChange={handleChange("kmPerHour")}
								placeholder="0.0"
								className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					{/* Mile metrics */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-700">Miles</h3>
						<div className="flex flex-col">
							<label
								htmlFor="minPerMile"
								className="text-sm font-medium text-gray-600 mb-1"
							>
								Pace (min/mile)
							</label>
							<div id="minPerMile" className="flex gap-2 items-center">
								<select
									value={values.minPerMile.minutes}
									onChange={(e) =>
										handlePaceChange("minPerMile", "minutes", e.target.value)
									}
									className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{generateOptions(3, 30).map((value) => (
										<option key={value} value={value}>
											{value}
										</option>
									))}
								</select>
								<span>:</span>
								<select
									value={values.minPerMile.seconds}
									onChange={(e) =>
										handlePaceChange("minPerMile", "seconds", e.target.value)
									}
									className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{generateOptions(0, 59, true).map((value) => (
										<option key={value} value={value}>
											{value}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex flex-col">
							<label
								htmlFor="milesPerHour"
								className="text-sm font-medium text-gray-600 mb-1"
							>
								Miles per Hour
							</label>
							<input
								id="milesPerHour"
								type="number"
								value={values.milesPerHour}
								onChange={handleChange("milesPerHour")}
								placeholder="0.0"
								className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>
			</div>
			{/* <RunEstimates
				times={calculateEstimates()}
				onTimeChange={handleTimeChange}
				onPaceChange={(distance, pacePerKm) => {
					setValues((prev) => ({
						...prev,
						minPerKm: (pacePerKm / 60).toFixed(2),
					}));
				}}
				onSpeedChange={(distance, speedKmH) => {
					setValues((prev) => ({
						...prev,
						kmPerHour: speedKmH.toFixed(2),
					}));
				}}
			/> */}
		</>
	);
};

export default ConvertView;
