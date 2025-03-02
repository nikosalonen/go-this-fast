import type React from "react";
import type { TimeInput } from "./RunEstimates";

interface DistanceTimeBoxProps {
	distance: string;
	time: TimeInput;
	onTimeChange: (field: keyof TimeInput, value: string) => void;
	disableHours?: boolean;
	onClose?: () => void;
}

export const DistanceTimeBox: React.FC<DistanceTimeBoxProps> = ({
	distance,
	time,
	onTimeChange,
	disableHours = false,
	onClose,
}) => {
	// Add arrays for dropdown options
	const hoursOptions = Array.from({ length: 25 }, (_, i) => i.toString());
	const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString());
	const secondsOptions = Array.from({ length: 60 }, (_, i) => i.toString());

	return (
		<div className="border p-4 rounded-lg relative">
			{onClose && (
				<button 
					onClick={onClose}
					className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
					aria-label={`Close ${distance}`}
				>
					✕
				</button>
			)}
			<h3 className="font-semibold mb-2">{distance}</h3>
			<div className="flex gap-2">
				{!disableHours && (
					<div>
						<label htmlFor={`${distance}-hours`} className="block text-sm">
							Hours
						</label>
						<select
							id={`${distance}-hours`}
							value={time.hours}
							onChange={(e) => onTimeChange("hours", e.target.value)}
							className="w-20 border rounded p-1"
						>
							<option value="">--</option>
							{hoursOptions.map((hour) => (
								<option key={hour} value={hour}>
									{hour}
								</option>
							))}
						</select>
					</div>
				)}
				<div>
					<label htmlFor={`${distance}-minutes`} className="block text-sm">
						Minutes
					</label>
					<select
						id={`${distance}-minutes`}
						value={time.minutes}
						onChange={(e) => onTimeChange("minutes", e.target.value)}
						className="w-20 border rounded p-1"
					>
						<option value="">--</option>
						{minutesOptions.map((minute) => (
							<option key={minute} value={minute}>
								{minute}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor={`${distance}-seconds`} className="block text-sm">
						Seconds
					</label>
					<select
						id={`${distance}-seconds`}
						value={time.seconds}
						onChange={(e) => onTimeChange("seconds", e.target.value)}
						className="w-20 border rounded p-1"
					>
						<option value="">--</option>
						{secondsOptions.map((second) => (
							<option key={second} value={second}>
								{second}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};
