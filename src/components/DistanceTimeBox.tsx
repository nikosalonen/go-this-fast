import type React from "react";
import type { TimeInput } from "./RunEstimates";

interface DistanceTimeBoxProps {
	distance: string;
	time: TimeInput;
	onTimeChange: (field: keyof TimeInput, value: string) => void;
	disableHours?: boolean;
}

export const DistanceTimeBox: React.FC<DistanceTimeBoxProps> = ({
	distance,
	time,
	onTimeChange,
	disableHours = false,
}) => {
	return (
		<div className="border p-4 rounded-lg">
			<h3 className="font-semibold mb-2">{distance}</h3>
			<div className="flex gap-2">
				{!disableHours && (
					<div>
						<label htmlFor={`${distance}-hours`} className="block text-sm">
							Hours
						</label>
						<input
							id={`${distance}-hours`}
							type="number"
							min="0"
							value={time.hours === "" ? "" : time.hours}
							onChange={(e) => onTimeChange("hours", e.target.value)}
							className="w-20 border rounded p-1"
						/>
					</div>
				)}
				<div>
					<label htmlFor={`${distance}-minutes`} className="block text-sm">
						Minutes
					</label>
					<input
						id={`${distance}-minutes`}
						type="number"
						min="0"
						max="59"
						value={time.minutes}
						onChange={(e) => onTimeChange("minutes", e.target.value)}
						className="w-20 border rounded p-1"
					/>
				</div>
				<div>
					<label htmlFor={`${distance}-seconds`} className="block text-sm">
						Seconds
					</label>
					<input
						id={`${distance}-seconds`}
						type="number"
						min="0"
						max="59"
						value={time.seconds}
						onChange={(e) => onTimeChange("seconds", e.target.value)}
						className="w-20 border rounded p-1"
					/>
				</div>
			</div>
		</div>
	);
};
