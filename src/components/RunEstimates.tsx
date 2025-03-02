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
	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		// Remove any leading zeros and convert empty string to "0"
		const cleanedValue = value.replace(/^0+/, "") || "0";
		onTimeChange(distance, field, cleanedValue);

		// Calculate total seconds using the updated time object
		const updatedTime = { ...times[distance], [field]: Number(cleanedValue) };
		const totalSeconds =
			(Number(updatedTime.hours) || 0) * 3600 +
			(Number(updatedTime.minutes) || 0) * 60 +
			(Number(updatedTime.seconds) || 0);

		// Extract distance value from the distance string
		const distanceMatch = distance.match(/(\d+(?:\.\d+)?)/);
		const distanceKm = distanceMatch
			? Number.parseFloat(distanceMatch[1])
			: Number.NaN;

		if (!Number.isNaN(distanceKm) && totalSeconds > 0) {
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
		// Define known distances in kilometers
		const distances: Record<string, number> = {
			"100m": 0.1,
			"400m": 0.4,
			"1km": 1,
			"1mile": 1.60934,
			"5km": 5,
			"10km": 10,
			"Half Marathon": 21.0975,
			Marathon: 42.195,
		};
		
		// Skip unknown distances
		if (!distances[sourceDistance]) return;
		
		// Update each distance based on the calculated pace
		Object.entries(distances).forEach(([distanceLabel, distanceKm]) => {
			// Skip the source distance that triggered the update
			if (distanceLabel === sourceDistance) return;
			
			// Calculate expected time for this distance based on the pace
			const totalSeconds = pacePerKm * distanceKm;
			
			// Calculate hours, minutes, seconds
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = Math.floor(totalSeconds % 60);
			
			// Update the hours
			if (times[distanceLabel].hours !== hours) {
				onTimeChange(distanceLabel, "hours", hours.toString());
			}
			
			// Update the minutes
			if (times[distanceLabel].minutes !== minutes) {
				onTimeChange(distanceLabel, "minutes", minutes.toString());
			}
			
			// Update the seconds
			if (times[distanceLabel].seconds !== seconds) {
				onTimeChange(distanceLabel, "seconds", seconds.toString());
			}
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
