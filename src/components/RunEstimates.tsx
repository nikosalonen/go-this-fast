import type React from "react";
import { useState } from "react";
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

		// Calculate total seconds using the new value
		const time = { ...times[distance], [field]: Number(cleanedValue) };
		const totalSeconds =
			(Number(time.hours) || 0) * 3600 +
			(Number(time.minutes) || 0) * 60 +
			(Number(time.seconds) || 0);

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
		}
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
