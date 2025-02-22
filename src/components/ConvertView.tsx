import type React from "react";
import { type ChangeEvent, useState } from "react";
import RunEstimates from "./RunEstimates";
import type { TimeInput } from "./RunEstimates";

const ConvertView: React.FC = () => {
	const [values, setValues] = useState({
		minPerKm: "",
		minPerMile: "",
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

	// Calculate estimated times based on current pace
	const calculateEstimates = () => {
		if (!values.minPerKm) return times;

		const paceInSeconds = Number.parseFloat(values.minPerKm) * 60; // Convert minutes to seconds
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

	// Update handleChange to also update estimates
	const handleChange =
		(field: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			const numValue = Number.parseFloat(newValue);

			if (!Number.isNaN(numValue) && numValue > 0) {
				const newValues = { ...values, [field]: newValue };

				switch (field) {
					case "minPerKm":
						newValues.kmPerHour = (60 / numValue).toFixed(2);
						newValues.minPerMile = (numValue * 1.60934).toFixed(2);
						newValues.milesPerHour = (37.282272 / numValue).toFixed(2);
						break;
					case "minPerMile":
						newValues.kmPerHour = (96.56064 / numValue).toFixed(2);
						newValues.minPerKm = (numValue / 1.60934).toFixed(2);
						newValues.milesPerHour = (60 / numValue).toFixed(2);
						break;
					case "kmPerHour":
						newValues.minPerKm = (60 / numValue).toFixed(2);
						newValues.minPerMile = (96.56064 / numValue).toFixed(2);
						newValues.milesPerHour = (numValue / 1.60934).toFixed(2);
						break;
					case "milesPerHour":
						newValues.minPerKm = (37.282272 / numValue).toFixed(2);
						newValues.minPerMile = (60 / numValue).toFixed(2);
						newValues.kmPerHour = (numValue * 1.60934).toFixed(2);
						break;
				}
				setValues(newValues);
				// Update times when minPerKm changes
				if (field === "minPerKm") {
					setTimes(calculateEstimates());
				}
			} else {
				setValues({ ...values, [field]: newValue });
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

				<div className="space-y-4">
					<div className="flex flex-col">
						<label
							htmlFor="minPerKm"
							className="text-sm font-medium text-gray-600 mb-1"
						>
							Minutes per Kilometer
						</label>
						<input
							id="minPerKm"
							type="number"
							value={values.minPerKm}
							onChange={handleChange("minPerKm")}
							placeholder="0:00"
							className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="flex flex-col">
						<label
							htmlFor="minPerMile"
							className="text-sm font-medium text-gray-600 mb-1"
						>
							Minutes per Mile
						</label>
						<input
							id="minPerMile"
							type="number"
							value={values.minPerMile}
							onChange={handleChange("minPerMile")}
							placeholder="0:00"
							className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
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
			<RunEstimates
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
			/>
		</>
	);
};

export default ConvertView;
