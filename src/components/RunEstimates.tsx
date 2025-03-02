import type React from "react";
import { DistanceTimeBox } from "./DistanceTimeBox";

export interface TimeInput {
	hours: number | "";
	minutes: number | "";
	seconds: number | "";
}

interface RunEstimatesProps {
	times: Record<string, TimeInput>;
	onTimeChange: (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => void;
	onPaceChange?: (distance: string, pacePerKm: number) => void;
	onSpeedChange?: (distance: string, speedKmH: number) => void;
}

const RunEstimates: React.FC<RunEstimatesProps> = ({
	times,
	onTimeChange,
	onPaceChange,
	onSpeedChange,
}) => {
	// Define known distances in kilometers - moved to component level for reuse
	const distances: Record<string, number> = {
		"100m": 0.1,
		"400m": 0.4,
		"1km": 1,
		"1mile": 1.60934,
		"5km": 5,
		"10km": 10,
		"Half Marathon": 21.0975,
		"Marathon": 42.195,
	};

	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		// Remove any leading zeros and convert empty string to "0"
		const cleanedValue = value.replace(/^0+/, "") || "0";
		onTimeChange(distance, field, cleanedValue);

		// Calculate total seconds using the updated time object
		const updatedTime = { ...times[distance], [field]: cleanedValue === "0" ? 0 : Number(cleanedValue) };
		const totalSeconds =
			(updatedTime.hours === "" ? 0 : Number(updatedTime.hours)) * 3600 +
			(updatedTime.minutes === "" ? 0 : Number(updatedTime.minutes)) * 60 +
			(updatedTime.seconds === "" ? 0 : Number(updatedTime.seconds));

		// Get distance value from our predefined mapping
		const distanceKm = distances[distance];

		if (distanceKm && totalSeconds > 0) {
			// Calculate pace (seconds per km)
			const pacePerKm = totalSeconds / distanceKm;
			onPaceChange?.(distance, pacePerKm);

			// Calculate speed (km/h)
			const speedKmH = (distanceKm / totalSeconds) * 3600;
			onSpeedChange?.(distance, speedKmH);
			
			// Update all other distance boxes based on this pace
			updateAllDistances(distance, pacePerKm);
		}
	};
	
	// Function to update all distances based on the pace from one distance
	const updateAllDistances = (sourceDistance: string, pacePerKm: number) => {
		// Skip unknown distances
		if (!distances[sourceDistance]) return;
		
		// Update each distance based on the calculated pace
		Object.entries(distances).forEach(([distanceLabel, distanceKm]) => {
			// Skip the source distance that triggered the update
			if (distanceLabel === sourceDistance) return;
			
			// Calculate expected time for this distance based on the pace
			const totalSeconds = pacePerKm * distanceKm;
			
			// Calculate hours, minutes, seconds
			let hours = Math.floor(totalSeconds / 3600);
			let minutes = Math.floor((totalSeconds % 3600) / 60);
			let seconds = Math.floor(totalSeconds % 60);
			
			// If this is a distance that hides hours but we have hours value,
			// convert hours to minutes for display
			if (shouldHideHours(distanceLabel) && hours > 0) {
				minutes += hours * 60;
				hours = 0;
			}
			
			// Always update all time fields to ensure consistency
			// First convert to string to match the expected type in onTimeChange
			onTimeChange(distanceLabel, "hours", hours.toString());
			onTimeChange(distanceLabel, "minutes", minutes.toString());
			onTimeChange(distanceLabel, "seconds", seconds.toString());
		});
	};

	const shouldHideHours = (distance: string): boolean => {
		const shortDistances = ["100m", "400m", "1km", "1mile", "5km"];
		return shortDistances.includes(distance);
	};

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Running Time Estimates</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{times && Object.entries(times).length > 0 ? (
					Object.entries(times).map(([distance, time]) => (
						<DistanceTimeBox
							key={distance}
							distance={distance}
							time={time}
							onTimeChange={(field, value) =>
								handleTimeChange(distance, field, value)
							}
							disableHours={shouldHideHours(distance)}
						/>
					))
				) : (
					<p>No time estimates available</p>
				)}
			</div>
		</div>
	);
};

export default RunEstimates;
